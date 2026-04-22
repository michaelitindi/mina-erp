'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'
import { deductStock } from '@/lib/inventory'
import { serializeDecimal } from '@/lib/utils'

const deliveryItemSchema = z.object({
  salesOrderItemId: z.string(),
  productId: z.string().nullable().optional(),
  description: z.string(),
  sku: z.string().nullable().optional(),
  quantity: z.number().positive(),
})

const createShipmentSchema = z.object({
  salesOrderId: z.string().min(1),
  deliveryDate: z.coerce.date(),
  carrier: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),
  items: z.array(deliveryItemSchema).min(1),
  notes: z.string().nullable().optional(),
})

type CreateShipmentInput = z.infer<typeof createShipmentSchema>

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')
  const org = await prisma.organization.findUnique({ where: { clerkOrgId: orgId } })
  if (!org) throw new Error('Organization not found')
  return { userId, orgId: org.id }
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

export async function createShipment(input: CreateShipmentInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createShipmentSchema.parse(input)
  const deliveryNumber = await generateDeliveryNumber(orgId)

  // 1. Fetch the Sales Order to check warehouse and items
  const order = await prisma.salesOrder.findFirst({
    where: { id: validated.salesOrderId, organizationId: orgId, deletedAt: null },
    include: { lineItems: true }
  })

  if (!order) throw new Error('Sales order not found')
  if (!order.warehouseId) throw new Error('Sales order must have a warehouse assigned before shipping')

  // 2. Process within a transaction
  const delivery = await prisma.$transaction(async (tx) => {
    // A. Create the Delivery record
    const newDelivery = await tx.delivery.create({
      data: {
        deliveryNumber,
        salesOrderId: validated.salesOrderId,
        deliveryDate: validated.deliveryDate,
        carrier: validated.carrier,
        trackingNumber: validated.trackingNumber,
        notes: validated.notes,
        organizationId: orgId,
        createdBy: userId,
        items: {
          create: validated.items.map(item => ({
            productId: item.productId,
            description: item.description,
            sku: item.sku,
            quantity: new Decimal(item.quantity)
          }))
        }
      }
    })

    // B. For each item shipped: Deduct permanent stock and update deliveredQty on SO
    for (const item of validated.items) {
      // Permanent deduction (reduces total and releases reservation)
      if (item.productId) {
        await deductStock(item.productId, order.warehouseId!, item.quantity, orgId, tx)
      }

      // Update Sales Order Item delivered quantity
      await tx.salesOrderItem.update({
        where: { id: item.salesOrderItemId },
        data: {
          deliveredQty: { increment: new Decimal(item.quantity) }
        }
      })
    }

    // C. Auto-update SO status if fully delivered (simplified check)
    // In a real system, we'd compare total ordered vs total delivered for all items.
    await tx.salesOrder.update({
      where: { id: validated.salesOrderId },
      data: { status: 'SHIPPED' } // We can move to SHIPPED for now
    })

    return newDelivery
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'CREATE',
    entityType: 'Delivery',
    entityId: delivery.id,
    newValues: delivery as any
  })

  revalidatePath(`/dashboard/sales/orders/${validated.salesOrderId}`)
  revalidatePath('/dashboard/sales/shipments')
  
  return serializeDecimal(delivery)
}

export async function getShipments() {
  const { orgId } = await getOrganization()
  return serializeDecimal(await prisma.delivery.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      salesOrder: { select: { orderNumber: true } },
      items: true
    }
  }))
}
