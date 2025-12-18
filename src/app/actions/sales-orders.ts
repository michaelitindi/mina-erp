'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const lineItemSchema = z.object({
  description: z.string().min(1),
  sku: z.string().nullable().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100).default(0),
  discountPercent: z.number().min(0).max(100).default(0),
})

const createSalesOrderSchema = z.object({
  customerId: z.string().min(1),
  orderDate: z.coerce.date(),
  expectedDeliveryDate: z.coerce.date().nullable().optional(),
  lineItems: z.array(lineItemSchema).min(1),
  shippingAddress: z.string().nullable().optional(),
  shippingCity: z.string().nullable().optional(),
  shippingCountry: z.string().nullable().optional(),
  shippingAmount: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional(),
})

type CreateSalesOrderInput = z.input<typeof createSalesOrderSchema>

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')
  
  let org = await prisma.organization.findUnique({ where: { clerkOrgId: orgId } })
  if (!org) {
    org = await prisma.organization.create({
      data: { clerkOrgId: orgId, name: 'My Organization', slug: orgId.toLowerCase().replace(/[^a-z0-9]/g, '-') }
    })
  }
  return { userId, orgId: org.id }
}

async function generateOrderNumber(orgId: string): Promise<string> {
  const lastOrder = await prisma.salesOrder.findFirst({
    where: { organizationId: orgId },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true }
  })
  if (!lastOrder) return 'SO-000001'
  const lastNum = parseInt(lastOrder.orderNumber.replace('SO-', '')) || 0
  return `SO-${String(lastNum + 1).padStart(6, '0')}`
}

export async function getSalesOrders() {
  const { orgId } = await getOrganization()
  return prisma.salesOrder.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { 
      customer: { select: { companyName: true } },
      _count: { select: { lineItems: true, deliveries: true } }
    }
  })
}

export async function getSalesOrder(id: string) {
  const { orgId } = await getOrganization()
  return prisma.salesOrder.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: { 
      customer: true,
      lineItems: true,
      deliveries: { where: { deletedAt: null } },
      returns: { where: { deletedAt: null } }
    }
  })
}

export async function createSalesOrder(input: CreateSalesOrderInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createSalesOrderSchema.parse(input)
  const orderNumber = await generateOrderNumber(orgId)

  // Calculate totals
  let subtotal = 0
  let taxAmount = 0
  const lineItemsData = validated.lineItems.map(item => {
    const lineSubtotal = item.quantity * item.unitPrice
    const discount = lineSubtotal * (item.discountPercent || 0) / 100
    const lineAfterDiscount = lineSubtotal - discount
    const lineTax = lineAfterDiscount * (item.taxRate || 0) / 100
    const lineTotal = lineAfterDiscount + lineTax
    
    subtotal += lineAfterDiscount
    taxAmount += lineTax
    
    return {
      description: item.description,
      sku: item.sku,
      quantity: new Decimal(item.quantity),
      unitPrice: new Decimal(item.unitPrice),
      taxRate: new Decimal(item.taxRate || 0),
      discountPercent: new Decimal(item.discountPercent || 0),
      lineTotal: new Decimal(lineTotal),
    }
  })

  const shippingAmount = validated.shippingAmount || 0
  const totalAmount = subtotal + taxAmount + shippingAmount

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId: validated.customerId,
      orderDate: validated.orderDate,
      expectedDeliveryDate: validated.expectedDeliveryDate,
      subtotal: new Decimal(subtotal),
      taxAmount: new Decimal(taxAmount),
      shippingAmount: new Decimal(shippingAmount),
      totalAmount: new Decimal(totalAmount),
      shippingAddress: validated.shippingAddress,
      shippingCity: validated.shippingCity,
      shippingCountry: validated.shippingCountry,
      notes: validated.notes,
      organizationId: orgId,
      createdBy: userId,
      lineItems: { create: lineItemsData }
    },
    include: { lineItems: true }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'SalesOrder', entityId: order.id, newValues: order as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/sales/orders')
  return order
}

export async function updateSalesOrderStatus(id: string, status: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.salesOrder.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Sales order not found')

  const order = await prisma.salesOrder.update({
    where: { id },
    data: { status, updatedBy: userId }
  })

  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'SalesOrder', entityId: order.id, oldValues: { status: existing.status }, newValues: { status: order.status } })
  revalidatePath('/dashboard/sales/orders')
  return order
}

export async function deleteSalesOrder(id: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.salesOrder.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Sales order not found')

  await prisma.salesOrder.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } })
  await logAudit({ organizationId: orgId, userId, action: 'DELETE', entityType: 'SalesOrder', entityId: id, oldValues: existing as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/sales/orders')
  return { success: true }
}

export async function getSalesOrderStats() {
  const { orgId } = await getOrganization()
  
  const [total, draft, confirmed, shipped, delivered] = await Promise.all([
    prisma.salesOrder.aggregate({ where: { organizationId: orgId, deletedAt: null }, _sum: { totalAmount: true }, _count: true }),
    prisma.salesOrder.aggregate({ where: { organizationId: orgId, status: 'DRAFT', deletedAt: null }, _sum: { totalAmount: true }, _count: true }),
    prisma.salesOrder.aggregate({ where: { organizationId: orgId, status: 'CONFIRMED', deletedAt: null }, _sum: { totalAmount: true }, _count: true }),
    prisma.salesOrder.aggregate({ where: { organizationId: orgId, status: 'SHIPPED', deletedAt: null }, _sum: { totalAmount: true }, _count: true }),
    prisma.salesOrder.aggregate({ where: { organizationId: orgId, status: 'DELIVERED', deletedAt: null }, _sum: { totalAmount: true }, _count: true }),
  ])

  return {
    total: { count: total._count, amount: Number(total._sum.totalAmount || 0) },
    draft: { count: draft._count, amount: Number(draft._sum.totalAmount || 0) },
    confirmed: { count: confirmed._count, amount: Number(confirmed._sum.totalAmount || 0) },
    shipped: { count: shipped._count, amount: Number(shipped._sum.totalAmount || 0) },
    delivered: { count: delivered._count, amount: Number(delivered._sum.totalAmount || 0) },
  }
}
