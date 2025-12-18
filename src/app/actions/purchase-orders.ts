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
})

const createPOSchema = z.object({
  vendorId: z.string().min(1),
  orderDate: z.coerce.date(),
  expectedDate: z.coerce.date().nullable().optional(),
  lineItems: z.array(lineItemSchema).min(1),
  shippingAmount: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional(),
})

type CreatePOInput = z.input<typeof createPOSchema>

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

async function generatePONumber(orgId: string): Promise<string> {
  const last = await prisma.purchaseOrder.findFirst({
    where: { organizationId: orgId },
    orderBy: { poNumber: 'desc' },
    select: { poNumber: true }
  })
  if (!last) return 'PO-000001'
  const lastNum = parseInt(last.poNumber.replace('PO-', '')) || 0
  return `PO-${String(lastNum + 1).padStart(6, '0')}`
}

export async function getPurchaseOrders() {
  const { orgId } = await getOrganization()
  return prisma.purchaseOrder.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { 
      vendor: { select: { companyName: true } },
      _count: { select: { lineItems: true, goodsReceipts: true } }
    }
  })
}

export async function createPurchaseOrder(input: CreatePOInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createPOSchema.parse(input)
  const poNumber = await generatePONumber(orgId)

  let subtotal = 0
  let taxAmount = 0
  const lineItemsData = validated.lineItems.map(item => {
    const lineSubtotal = item.quantity * item.unitPrice
    const lineTax = lineSubtotal * (item.taxRate || 0) / 100
    subtotal += lineSubtotal
    taxAmount += lineTax
    return {
      description: item.description,
      sku: item.sku,
      quantity: new Decimal(item.quantity),
      unitPrice: new Decimal(item.unitPrice),
      taxRate: new Decimal(item.taxRate || 0),
      lineTotal: new Decimal(lineSubtotal + lineTax),
    }
  })

  const totalAmount = subtotal + taxAmount + (validated.shippingAmount || 0)

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      vendorId: validated.vendorId,
      orderDate: validated.orderDate,
      expectedDate: validated.expectedDate,
      subtotal: new Decimal(subtotal),
      taxAmount: new Decimal(taxAmount),
      shippingAmount: new Decimal(validated.shippingAmount || 0),
      totalAmount: new Decimal(totalAmount),
      notes: validated.notes,
      organizationId: orgId,
      createdBy: userId,
      lineItems: { create: lineItemsData }
    },
    include: { lineItems: true }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'PurchaseOrder', entityId: po.id, newValues: po as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/procurement/purchase-orders')
  return po
}

export async function updatePOStatus(id: string, status: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.purchaseOrder.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Purchase order not found')

  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: { status, updatedBy: userId }
  })

  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'PurchaseOrder', entityId: po.id, oldValues: { status: existing.status }, newValues: { status: po.status } })
  revalidatePath('/dashboard/procurement/purchase-orders')
  return po
}

export async function deletePurchaseOrder(id: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.purchaseOrder.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Purchase order not found')

  await prisma.purchaseOrder.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } })
  await logAudit({ organizationId: orgId, userId, action: 'DELETE', entityType: 'PurchaseOrder', entityId: id, oldValues: existing as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/procurement/purchase-orders')
  return { success: true }
}

export async function getPOStats() {
  const { orgId } = await getOrganization()
  
  const [total, draft, sent, received] = await Promise.all([
    prisma.purchaseOrder.aggregate({ where: { organizationId: orgId, deletedAt: null }, _sum: { totalAmount: true }, _count: true }),
    prisma.purchaseOrder.count({ where: { organizationId: orgId, status: 'DRAFT', deletedAt: null } }),
    prisma.purchaseOrder.count({ where: { organizationId: orgId, status: 'SENT', deletedAt: null } }),
    prisma.purchaseOrder.count({ where: { organizationId: orgId, status: 'RECEIVED', deletedAt: null } }),
  ])

  return {
    total: { count: total._count, amount: Number(total._sum.totalAmount || 0) },
    draft,
    sent,
    received,
  }
}
