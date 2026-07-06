'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'
import { serializeDecimal } from '@/lib/utils'
import { getOrgWithModuleCheck } from '@/lib/module-access'

async function getOrganization() {
  const { userId, orgId } = await getOrgWithModuleCheck('INVENTORY')
  return { userId, orgId }
}

async function generateReceiptNumber(orgId: string): Promise<string> {
  const last = await prisma.goodsReceipt.findFirst({
    where: { organizationId: orgId },
    orderBy: { receiptNumber: 'desc' },
    select: { receiptNumber: true }
  })
  if (!last) return 'GR-000001'
  const lastNum = parseInt(last.receiptNumber.replace('GR-', '')) || 0
  return `GR-${String(lastNum + 1).padStart(6, '0')}`
}

const createReceiptSchema = z.object({
  purchaseOrderId: z.string().min(1),
  warehouseId: z.string().min(1),
  notes: z.string().nullable().optional(),
  items: z.array(z.object({
    productId: z.string().nullable().optional(),
    description: z.string().min(1),
    orderedQty: z.number().positive(),
    receivedQty: z.number().nonnegative(),
    acceptedQty: z.number().nonnegative(),
    rejectedQty: z.number().nonnegative().default(0),
    notes: z.string().nullable().optional(),
  })).min(1)
})

type CreateReceiptInput = z.input<typeof createReceiptSchema>

export async function getGoodsReceipts() {
  const { orgId } = await getOrganization()
  return prisma.goodsReceipt.findMany({
    where: { organizationId: orgId },
    orderBy: { receiptDate: 'desc' },
    include: {
      purchaseOrder: { select: { poNumber: true } },
      warehouse: { select: { name: true } },
      _count: { select: { items: true } }
    }
  })
}

export async function createGoodsReceipt(input: CreateReceiptInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createReceiptSchema.parse(input)
  const receiptNumber = await generateReceiptNumber(orgId)

  const receipt = await prisma.goodsReceipt.create({
    data: {
      receiptNumber,
      purchaseOrderId: validated.purchaseOrderId,
      warehouseId: validated.warehouseId,
      notes: validated.notes,
      organizationId: orgId,
      createdBy: userId,
      items: {
        create: validated.items.map(item => ({
          productId: item.productId,
          description: item.description,
          orderedQty: new Decimal(item.orderedQty),
          receivedQty: new Decimal(item.receivedQty),
          acceptedQty: new Decimal(item.acceptedQty),
          rejectedQty: new Decimal(item.rejectedQty),
          notes: item.notes,
        }))
      }
    },
    include: { items: true }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'GoodsReceipt', entityId: receipt.id, newValues: receipt as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/procurement/goods-receipts')
  return serializeDecimal(receipt)
}

export async function updateGoodsReceiptStatus(id: string, status: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.goodsReceipt.findFirst({
    where: { id, organizationId: orgId },
    include: { items: true }
  })
  if (!existing) throw new Error('Goods receipt not found')
  if (existing.status === 'COMPLETED') throw new Error('Goods receipt is already completed')

  const updateData: Record<string, unknown> = { status, updatedBy: userId }

  if (status === 'COMPLETED') {
    await prisma.$transaction(async (tx) => {
      // Find last Stock Movement number
      const lastMovement = await tx.stockMovement.findFirst({
        where: { organizationId: orgId },
        orderBy: { movementNumber: 'desc' },
        select: { movementNumber: true }
      })
      let lastNum = lastMovement ? (parseInt(lastMovement.movementNumber.replace('SM-', '')) || 0) : 0

      // Increment stock for accepted quantities
      for (const item of existing.items) {
        if (item.productId && Number(item.acceptedQty) > 0) {
          lastNum++
          const movementNumber = `SM-${String(lastNum).padStart(6, '0')}`

          // 1. Create StockMovement IN
          await tx.stockMovement.create({
            data: {
              organizationId: orgId,
              movementNumber,
              productId: item.productId,
              type: 'IN',
              reason: 'PURCHASE',
              quantity: item.acceptedQty,
              toWarehouseId: existing.warehouseId,
              referenceType: 'GOODS_RECEIPT',
              referenceId: existing.id,
              notes: `Received from PO via Receipt ${existing.receiptNumber}`,
              createdBy: userId
            }
          })

          // 2. Increment StockLevel
          await tx.stockLevel.upsert({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: existing.warehouseId
              }
            },
            create: {
              organizationId: orgId,
              productId: item.productId,
              warehouseId: existing.warehouseId,
              quantity: item.acceptedQty,
              availableQty: item.acceptedQty,
            },
            update: {
              quantity: { increment: item.acceptedQty },
              availableQty: { increment: item.acceptedQty }
            }
          })
        }
      }

      // Update Goods Receipt Status
      await tx.goodsReceipt.update({
        where: { id },
        data: updateData
      })

      // Update Purchase Order status to RECEIVED
      await tx.purchaseOrder.update({
        where: { id: existing.purchaseOrderId },
        data: { status: 'RECEIVED', updatedBy: userId }
      })
    })
  } else {
    await prisma.goodsReceipt.update({
      where: { id },
      data: updateData
    })
  }

  const updatedReceipt = await prisma.goodsReceipt.findUnique({ where: { id } })
  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'GoodsReceipt', entityId: id, oldValues: { status: existing.status }, newValues: { status } })
  revalidatePath('/dashboard/procurement/goods-receipts')
  return serializeDecimal(updatedReceipt)
}
