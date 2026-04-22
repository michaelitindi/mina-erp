'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'
import { serializeDecimal } from '@/lib/utils'
import { reserveStock, releaseStock } from '@/lib/inventory'
import { processInvoiceCreation } from './invoices'

const lineItemSchema = z.object({
  description: z.string().min(1),
  sku: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100).default(0),
  discountPercent: z.number().min(0).max(100).default(0),
})

const createSalesOrderSchema = z.object({
  customerId: z.string().min(1),
  warehouseId: z.string().nullable().optional(),
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

export async function getSalesOrders(page: number = 1, limit: number = 50) {
  const { orgId } = await getOrganization()
  
  const skip = (page - 1) * limit
  const take = Math.min(limit, 100)

  const [orders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { 
        customer: { select: { companyName: true } },
        _count: { select: { lineItems: true, deliveries: true } }
      }
    }),
    prisma.salesOrder.count({
      where: { organizationId: orgId, deletedAt: null }
    })
  ])

  return serializeDecimal({
    items: orders,
    pagination: { page, limit: take, total, pages: Math.ceil(total / take) }
  })
}

export async function getSalesOrder(id: string) {
  const { orgId } = await getOrganization()
  return serializeDecimal(await prisma.salesOrder.findFirst({
    where: { id, organizationId: orgId, deletedAt: null },
    include: { 
      customer: true,
      warehouse: true,
      lineItems: {
        include: { product: true }
      },
      deliveries: { where: { deletedAt: null } },
      returns: { where: { deletedAt: null } }
    }
  }))
}

export async function createSalesOrder(input: CreateSalesOrderInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createSalesOrderSchema.parse(input)
  const orderNumber = await generateOrderNumber(orgId)

  // Resolve product IDs if they are missing but SKU is present
  const resolvedItems = await Promise.all(validated.lineItems.map(async (item) => {
    let productId = item.productId
    if (!productId && item.sku) {
      const product = await prisma.product.findFirst({
        where: { sku: item.sku, organizationId: orgId, deletedAt: null }
      })
      productId = product?.id || null
    }
    return { ...item, productId }
  }))

  // Calculate totals
  let subtotal = 0
  let taxAmount = 0
  const lineItemsData = resolvedItems.map(item => {
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
      productId: item.productId,
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
      warehouseId: validated.warehouseId,
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
  return serializeDecimal(order)
}

/**
 * Advanced status update with Inventory Reservation logic
 */
export async function updateSalesOrderStatus(id: string, status: string): Promise<any> {
  const { userId, orgId } = await getOrganization()
  
  const existing = await prisma.salesOrder.findFirst({ 
    where: { id, organizationId: orgId, deletedAt: null },
    include: { lineItems: true }
  })
  if (!existing) throw new Error('Sales order not found')

  // Prevent invalid transitions
  if (existing.status === 'CANCELLED') throw new Error('Cannot update a cancelled order')
  if (existing.status === 'DELIVERED') throw new Error('Cannot update a delivered order')

  const result = await prisma.$transaction(async (tx) => {
    // Logic 1: Moving to CONFIRMED - Reserve Stock
    if (status === 'CONFIRMED' && existing.status === 'DRAFT' && !existing.stockReserved) {
      if (!existing.warehouseId) throw new Error('Cannot confirm order without a warehouse selected')
      
      for (const item of existing.lineItems) {
        if (item.productId) {
          await reserveStock(item.productId, existing.warehouseId, item.quantity, orgId, tx)
        }
      }
      
      await tx.salesOrder.update({
        where: { id },
        data: { stockReserved: true }
      })
    }

    // Logic 2: Moving to CANCELLED - Release Stock if it was reserved
    if (status === 'CANCELLED' && existing.stockReserved) {
      if (!existing.warehouseId) throw new Error('Critical error: reserved stock has no warehouse link')
      
      for (const item of existing.lineItems) {
        if (item.productId) {
          await releaseStock(item.productId, existing.warehouseId, item.quantity, orgId, tx)
        }
      }

      await tx.salesOrder.update({
        where: { id },
        data: { stockReserved: false }
      })
    }

    // Update the actual status
    const updated = await tx.salesOrder.update({
      where: { id },
      data: { status, updatedBy: userId }
    })

    return updated
  })

  await logAudit({ 
    organizationId: orgId, 
    userId, 
    action: 'UPDATE', 
    entityType: 'SalesOrder', 
    entityId: existing.id, 
    oldValues: { status: existing.status }, 
    newValues: { status: result.status } 
  })
  
  revalidatePath('/dashboard/sales/orders')
  revalidatePath(`/dashboard/sales/orders/${id}`)
  return serializeDecimal(result)
}

export async function deleteSalesOrder(id: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.salesOrder.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Sales order not found')

  // If deleting a confirmed order, we should probably release stock, but typically 
  // enterprise systems block deletion of confirmed orders. We'll block it for safety.
  if (existing.status !== 'DRAFT' && existing.status !== 'CANCELLED') {
    throw new Error('Only DRAFT or CANCELLED orders can be deleted. Please cancel the order first to release stock.')
  }

  await prisma.salesOrder.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } })
  await logAudit({ organizationId: orgId, userId, action: 'DELETE', entityType: 'SalesOrder', entityId: id, oldValues: existing as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/sales/orders')
  return { success: true }
}

export async function createInvoiceFromSalesOrder(orderId: string) {
  const { userId, orgId } = await getOrganization()

  const order = await prisma.salesOrder.findFirst({
    where: { id: orderId, organizationId: orgId, deletedAt: null },
    include: { lineItems: true }
  })

  if (!order) throw new Error('Sales order not found')
  if (order.status === 'DRAFT' || order.status === 'CANCELLED') {
    throw new Error('Invoices can only be generated for confirmed, processing, or shipped orders.')
  }
  if (order.invoiceId) throw new Error('An invoice has already been generated for this order.')

  // Map Sales Order items to Invoice input
  const invoiceData = {
    customerId: order.customerId,
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Default 15 days
    notes: `Generated from Sales Order ${order.orderNumber}. ${order.notes || ''}`,
    lineItems: order.lineItems.map(item => ({
      description: item.description,
      sku: item.sku,
      productId: item.productId,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      taxRate: Number(item.taxRate),
    }))
  }

  const invoice = await processInvoiceCreation(orgId, userId, invoiceData as any)

  // Link invoice back to Sales Order
  await prisma.salesOrder.update({
    where: { id: orderId },
    data: { invoiceId: invoice.id }
  })

  revalidatePath(`/dashboard/sales/orders/${orderId}`)
  revalidatePath('/dashboard/finance/invoices')

  return serializeDecimal(invoice)
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

  return serializeDecimal({
    total: { count: total._count, amount: Number(total._sum.totalAmount || 0) },
    draft: { count: draft._count, amount: Number(draft._sum.totalAmount || 0) },
    confirmed: { count: confirmed._count, amount: Number(confirmed._sum.totalAmount || 0) },
    shipped: { count: shipped._count, amount: Number(shipped._sum.totalAmount || 0) },
    delivered: { count: delivered._count, amount: Number(delivered._sum.totalAmount || 0) },
  })
}
