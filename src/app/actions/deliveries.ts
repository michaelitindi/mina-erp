'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'
import { serializeDecimal } from '@/lib/utils'

const createDeliverySchema = z.object({
  salesOrderId: z.string().min(1),
  carrier: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  shippingAddress: z.string().nullable().optional(),
  shippingCity: z.string().nullable().optional(),
  shippingCountry: z.string().nullable().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    sku: z.string().nullable().optional(),
    quantity: z.number().positive(),
  })).min(1),
  notes: z.string().nullable().optional(),
})

type CreateDeliveryInput = z.input<typeof createDeliverySchema>

import { getOrgWithModuleCheck } from '@/lib/module-access'

async function getOrganization() {
  const { userId, orgId } = await getOrgWithModuleCheck('SALES')
  return { userId, orgId }
}

async function generateDeliveryNumber(orgId: string): Promise<string> {
  const last = await prisma.delivery.findFirst({
    where: { organizationId: orgId },
    orderBy: { deliveryNumber: 'desc' },
    select: { deliveryNumber: true }
  })
  if (!last) return 'DEL-000001'
  const lastNum = parseInt(last.deliveryNumber.replace('DEL-', '')) || 0
  return `DEL-${String(lastNum + 1).padStart(6, '0')}`
}

export async function getDeliveries() {
  const { orgId } = await getOrganization()
  return serializeDecimal(await prisma.delivery.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { 
      salesOrder: { select: { orderNumber: true, customer: { select: { companyName: true } } } },
      _count: { select: { items: true } }
    }
  }))
}

export async function createDelivery(input: CreateDeliveryInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createDeliverySchema.parse(input)
  const deliveryNumber = await generateDeliveryNumber(orgId)

  // Look up product IDs by SKU
  const skus = validated.items.map(i => i.sku).filter(Boolean) as string[]
  const products = skus.length > 0 ? await prisma.product.findMany({
    where: { organizationId: orgId, sku: { in: skus }, deletedAt: null },
    select: { id: true, sku: true }
  }) : []

  const productMap = products.reduce((acc, p) => {
    if (p.sku) acc[p.sku] = p.id
    return acc
  }, {} as Record<string, string>)

  const delivery = await prisma.delivery.create({
    data: {
      deliveryNumber,
      salesOrderId: validated.salesOrderId,
      carrier: validated.carrier,
      trackingNumber: validated.trackingNumber,
      shippingAddress: validated.shippingAddress,
      shippingCity: validated.shippingCity,
      shippingCountry: validated.shippingCountry,
      notes: validated.notes,
      organizationId: orgId,
      createdBy: userId,
      items: {
        create: validated.items.map(item => ({
          productId: item.sku ? productMap[item.sku] || null : null,
          description: item.description,
          sku: item.sku,
          quantity: new Decimal(item.quantity),
        }))
      }
    },
    include: { items: true }
  })

  // Update sales order status if creating a delivery
  await prisma.salesOrder.update({
    where: { id: validated.salesOrderId },
    data: { status: 'SHIPPED', updatedBy: userId }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'Delivery', entityId: delivery.id, newValues: delivery as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/sales/shipments')
  return serializeDecimal(delivery)
}

export async function updateDeliveryStatus(id: string, status: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.delivery.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Delivery not found')

  const updateData: Record<string, unknown> = { status, updatedBy: userId }
  if (status === 'DELIVERED') {
    updateData.deliveredAt = new Date()

    // 1. Fetch default warehouse
    const warehouse = await prisma.warehouse.findFirst({
      where: { organizationId: orgId, deletedAt: null }
    })
    if (!warehouse) {
      throw new Error('A warehouse must be registered before shipments can be processed.')
    }

    // 2. Fetch delivery items
    const deliveryWithItems = await prisma.delivery.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: { items: true }
    })
    if (!deliveryWithItems) throw new Error('Delivery not found')

    await prisma.$transaction(async (tx) => {
      // Find last Stock Movement number
      const lastMovement = await tx.stockMovement.findFirst({
        where: { organizationId: orgId },
        orderBy: { movementNumber: 'desc' },
        select: { movementNumber: true }
      })
      let lastNum = lastMovement ? (parseInt(lastMovement.movementNumber.replace('SM-', '')) || 0) : 0

      for (const item of deliveryWithItems.items) {
        if (item.productId) {
          const qty = Number(item.quantity)

          // Verify stock levels first
          const currentStock = await tx.stockLevel.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: warehouse.id
              }
            }
          })

          const available = currentStock ? Number(currentStock.quantity) : 0
          if (available < qty) {
            throw new Error(`Insufficient stock for product "${item.description}". Required: ${qty}, Available: ${available}`)
          }

          // Generate movement number
          lastNum++
          const movementNumber = `SM-${String(lastNum).padStart(6, '0')}`

          // Deduct stock
          await tx.stockLevel.update({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: warehouse.id
              }
            },
            data: {
              quantity: { decrement: qty },
              availableQty: { decrement: qty }
            }
          })

          // Create stock movement record
          await tx.stockMovement.create({
            data: {
              organizationId: orgId,
              movementNumber,
              productId: item.productId,
              type: 'OUT',
              reason: 'SALE',
              quantity: new Decimal(-qty),
              fromWarehouseId: warehouse.id,
              referenceType: 'DELIVERY',
              referenceId: id,
              notes: `Flipped to DELIVERED via note ${existing.deliveryNumber}`,
              createdBy: userId
            }
          })
        }
      }

      // Update Sales Order
      await tx.salesOrder.update({
        where: { id: existing.salesOrderId },
        data: { status: 'DELIVERED', updatedBy: userId }
      })

      // Update Delivery status
      await tx.delivery.update({
        where: { id },
        data: updateData
      })
    })
  } else {
    await prisma.delivery.update({ where: { id }, data: updateData })
  }

  const delivery = await prisma.delivery.findUnique({ where: { id } })
  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'Delivery', entityId: id, oldValues: { status: existing.status }, newValues: { status } })
  revalidatePath('/dashboard/sales/shipments')
  return serializeDecimal(delivery)
}

export async function updateTracking(id: string, carrier: string, trackingNumber: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.delivery.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Delivery not found')

  const delivery = await prisma.delivery.update({
    where: { id },
    data: { carrier, trackingNumber, updatedBy: userId }
  })

  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'Delivery', entityId: delivery.id, oldValues: { carrier: existing.carrier, trackingNumber: existing.trackingNumber }, newValues: { carrier, trackingNumber } })
  revalidatePath('/dashboard/sales/shipments')
  return serializeDecimal(delivery)
}

export async function deleteDelivery(id: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.delivery.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Delivery not found')

  await prisma.delivery.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } })
  await logAudit({ organizationId: orgId, userId, action: 'DELETE', entityType: 'Delivery', entityId: id, oldValues: existing as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/sales/shipments')
  return { success: true }
}

export async function getDeliveryStats() {
  const { orgId } = await getOrganization()
  
  const [total, pending, inTransit, delivered] = await Promise.all([
    prisma.delivery.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.delivery.count({ where: { organizationId: orgId, status: 'PENDING', deletedAt: null } }),
    prisma.delivery.count({ where: { organizationId: orgId, status: 'IN_TRANSIT', deletedAt: null } }),
    prisma.delivery.count({ where: { organizationId: orgId, status: 'DELIVERED', deletedAt: null } }),
  ])

  return serializeDecimal({ total, pending, inTransit, delivered })
}
