'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const createBOMSchema = z.object({
  name: z.string().min(1),
  productId: z.string().min(1),
  notes: z.string().nullable().optional(),
  components: z.array(z.object({
    description: z.string().min(1),
    productId: z.string().nullable().optional(),
    quantity: z.number().positive(),
    unit: z.string().default('EACH'),
    wastagePercent: z.number().min(0).max(100).default(0),
  })).min(1),
})

type CreateBOMInput = z.input<typeof createBOMSchema>

import { getOrgWithModuleCheck } from '@/lib/module-access'

async function getOrganization() {
  const { userId, orgId } = await getOrgWithModuleCheck('MANUFACTURING')
  return { userId, orgId }
}

async function generateBOMNumber(orgId: string): Promise<string> {
  const last = await prisma.billOfMaterials.findFirst({
    where: { organizationId: orgId },
    orderBy: { bomNumber: 'desc' },
    select: { bomNumber: true }
  })
  if (!last) return 'BOM-000001'
  const lastNum = parseInt(last.bomNumber.replace('BOM-', '')) || 0
  return `BOM-${String(lastNum + 1).padStart(6, '0')}`
}

async function generateWONumber(orgId: string): Promise<string> {
  const last = await prisma.workOrder.findFirst({
    where: { organizationId: orgId },
    orderBy: { workOrderNumber: 'desc' },
    select: { workOrderNumber: true }
  })
  if (!last) return 'WO-000001'
  const lastNum = parseInt(last.workOrderNumber.replace('WO-', '')) || 0
  return `WO-${String(lastNum + 1).padStart(6, '0')}`
}

export async function getBOMs() {
  const { orgId } = await getOrganization()
  return prisma.billOfMaterials.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { components: true, workOrders: true } } }
  })
}

export async function createBOM(input: CreateBOMInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createBOMSchema.parse(input)
  const bomNumber = await generateBOMNumber(orgId)

  const bom = await prisma.billOfMaterials.create({
    data: {
      bomNumber,
      name: validated.name,
      productId: validated.productId,
      notes: validated.notes,
      organizationId: orgId,
      createdBy: userId,
      components: {
        create: validated.components.map(c => ({
          description: c.description,
          productId: c.productId,
          quantity: new Decimal(c.quantity),
          unit: c.unit,
          wastagePercent: new Decimal(c.wastagePercent || 0),
        }))
      }
    },
    include: { components: true }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'BillOfMaterials', entityId: bom.id, newValues: bom as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/manufacturing')
  return bom
}

export async function updateBOMStatus(id: string, status: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.billOfMaterials.findFirst({ where: { id, organizationId: orgId } })
  if (!existing) throw new Error('BOM not found')

  const bom = await prisma.billOfMaterials.update({ where: { id }, data: { status, updatedBy: userId } })
  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'BillOfMaterials', entityId: bom.id, oldValues: { status: existing.status }, newValues: { status } })
  revalidatePath('/dashboard/manufacturing')
  return bom
}

// Work Orders
export async function getWorkOrders() {
  const { orgId } = await getOrganization()
  return prisma.workOrder.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    include: { bom: { select: { bomNumber: true, name: true } } }
  })
}

const createWorkOrderSchema = z.object({
  bomId: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  quantity: z.number().positive(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  plannedStart: z.coerce.date().nullable().optional(),
  plannedEnd: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  warehouseId: z.string().nullable().optional(),
})

type CreateWorkOrderInput = z.input<typeof createWorkOrderSchema>

export async function createWorkOrder(input: CreateWorkOrderInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createWorkOrderSchema.parse(input)
  const workOrderNumber = await generateWONumber(orgId)

  const workOrder = await prisma.workOrder.create({
    data: {
      workOrderNumber,
      bomId: validated.bomId,
      productId: validated.productId,
      quantity: new Decimal(validated.quantity),
      priority: validated.priority,
      plannedStart: validated.plannedStart,
      plannedEnd: validated.plannedEnd,
      notes: validated.notes,
      warehouseId: validated.warehouseId,
      organizationId: orgId,
      createdBy: userId,
    }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'WorkOrder', entityId: workOrder.id, newValues: workOrder as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/manufacturing')
  return workOrder
}

export async function updateWorkOrderStatus(id: string, status: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.workOrder.findFirst({
    where: { id, organizationId: orgId },
    include: {
      bom: {
        include: {
          components: true
        }
      }
    }
  })
  if (!existing) throw new Error('Work order not found')
  if (existing.status === 'COMPLETED') throw new Error('Work order is already completed')

  let targetWarehouseId = existing.warehouseId
  if (!targetWarehouseId && (status === 'IN_PROGRESS' || status === 'COMPLETED')) {
    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { organizationId: orgId, deletedAt: null }
    })
    if (defaultWarehouse) {
      targetWarehouseId = defaultWarehouse.id
    } else {
      throw new Error('A warehouse must be registered before production can be started or completed')
    }
  }

  // If starting or completing, perform shortage check if warehouse is assigned
  if ((status === 'IN_PROGRESS' || status === 'COMPLETED') && existing.bom) {
    // Check availability for each component
    for (const c of existing.bom.components) {
      if (c.productId && targetWarehouseId) {
        // Calculate requirement: WO qty * component qty * (1 + wastage / 100)
        const wastageCoeff = new Decimal(1).add(new Decimal(c.wastagePercent).div(100))
        const requiredQty = new Decimal(existing.quantity).mul(c.quantity).mul(wastageCoeff)

        const stock = await prisma.stockLevel.findUnique({
          where: {
            productId_warehouseId: {
              productId: c.productId,
              warehouseId: targetWarehouseId
            }
          }
        })

        const available = stock ? new Decimal(stock.quantity) : new Decimal(0)
        if (available.lt(requiredQty)) {
          throw new Error(`Insufficient stock for component "${c.description}". Required: ${requiredQty.toFixed(2)}, Available: ${available.toFixed(2)}`)
        }
      }
    }
  }

  const updateData: Record<string, unknown> = { status, updatedBy: userId }
  if (status === 'IN_PROGRESS' && !existing.actualStart) updateData.actualStart = new Date()
  if (status === 'COMPLETED') updateData.actualEnd = new Date()

  // If completed, execute inventory movements in a transaction
  if (status === 'COMPLETED') {
    await prisma.$transaction(async (tx) => {
      // Find last SM number
      const lastMovement = await tx.stockMovement.findFirst({
        where: { organizationId: orgId },
        orderBy: { movementNumber: 'desc' },
        select: { movementNumber: true }
      })
      let lastNum = lastMovement ? (parseInt(lastMovement.movementNumber.replace('SM-', '')) || 0) : 0

      // 1. Consume components
      if (existing.bom) {
        for (const c of existing.bom.components) {
          if (c.productId && targetWarehouseId) {
            const wastageCoeff = new Decimal(1).add(new Decimal(c.wastagePercent).div(100))
            const requiredQty = new Decimal(existing.quantity).mul(c.quantity).mul(wastageCoeff)

            lastNum++
            const movementNumber = `SM-${String(lastNum).padStart(6, '0')}`

            // Create movement OUT
            await tx.stockMovement.create({
              data: {
                organizationId: orgId,
                movementNumber,
                productId: c.productId,
                type: 'OUT',
                reason: 'MANUFACTURING',
                quantity: requiredQty.negated(),
                fromWarehouseId: targetWarehouseId,
                referenceType: 'WORK_ORDER',
                referenceId: existing.id,
                notes: `Consumed for Work Order ${existing.workOrderNumber}`,
                createdBy: userId
              }
            })

            // Decrement StockLevel
            await tx.stockLevel.upsert({
              where: {
                productId_warehouseId: {
                  productId: c.productId,
                  warehouseId: targetWarehouseId
                }
              },
              create: {
                organizationId: orgId,
                productId: c.productId,
                warehouseId: targetWarehouseId,
                quantity: requiredQty.negated(),
                availableQty: requiredQty.negated(),
              },
              update: {
                quantity: { decrement: requiredQty },
                availableQty: { decrement: requiredQty }
              }
            })
          }
        }
      }

      // 2. Receive finished product
      if (existing.productId && targetWarehouseId) {
        lastNum++
        const movementNumber = `SM-${String(lastNum).padStart(6, '0')}`

        // Create movement IN
        await tx.stockMovement.create({
          data: {
            organizationId: orgId,
            movementNumber,
            productId: existing.productId,
            type: 'IN',
            reason: 'MANUFACTURING',
            quantity: new Decimal(existing.quantity),
            toWarehouseId: targetWarehouseId,
            referenceType: 'WORK_ORDER',
            referenceId: existing.id,
            notes: `Produced by Work Order ${existing.workOrderNumber}`,
            createdBy: userId
          }
        })

        // Increment StockLevel
        await tx.stockLevel.upsert({
          where: {
            productId_warehouseId: {
              productId: existing.productId,
              warehouseId: targetWarehouseId
            }
          },
          create: {
            organizationId: orgId,
            productId: existing.productId,
            warehouseId: targetWarehouseId,
            quantity: new Decimal(existing.quantity),
            availableQty: new Decimal(existing.quantity),
          },
          update: {
            quantity: { increment: new Decimal(existing.quantity) },
            availableQty: { increment: new Decimal(existing.quantity) }
          }
        })
      }

      // Update work order status in transaction
      await tx.workOrder.update({
        where: { id },
        data: {
          ...updateData,
          warehouseId: targetWarehouseId,
          completedQty: new Decimal(existing.quantity)
        }
      })
    })
  } else {
    await prisma.workOrder.update({
      where: { id },
      data: {
        ...updateData,
        ...(targetWarehouseId ? { warehouseId: targetWarehouseId } : {})
      }
    })
  }

  const updatedWO = await prisma.workOrder.findUnique({ where: { id } })
  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'WorkOrder', entityId: id, newValues: { status } })
  revalidatePath('/dashboard/manufacturing')
  return serializeDecimal({ ...updatedWO, success: true })
}

export async function triggerManufacturingOrdersForSalesOrder(
  orgId: string,
  userId: string,
  salesOrderId: string,
  lineItems: Array<{ productId?: string | null; quantity: number | Decimal }>
) {
  for (const item of lineItems) {
    if (!item.productId) continue

    // Find active BOM for product
    const bom = await prisma.billOfMaterials.findFirst({
      where: { organizationId: orgId, productId: item.productId, status: 'ACTIVE' }
    })

    if (bom) {
      const workOrderNumber = await generateWONumber(orgId)
      const defaultWarehouse = await prisma.warehouse.findFirst({
        where: { organizationId: orgId, deletedAt: null }
      })

      await prisma.workOrder.create({
        data: {
          organizationId: orgId,
          workOrderNumber,
          bomId: bom.id,
          productId: item.productId,
          quantity: new Decimal(item.quantity),
          status: 'PLANNED',
          priority: 'HIGH',
          warehouseId: defaultWarehouse?.id || null,
          notes: `Auto-triggered from Sales Order (${salesOrderId})`,
          createdBy: userId
        }
      })
    }
  }
}

export async function getManufacturingStats() {
  const { orgId } = await getOrganization()
  
  const [totalBOMs, activeBOMs, totalWOs, activeWOs] = await Promise.all([
    prisma.billOfMaterials.count({ where: { organizationId: orgId } }),
    prisma.billOfMaterials.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
    prisma.workOrder.count({ where: { organizationId: orgId } }),
    prisma.workOrder.count({ where: { organizationId: orgId, status: 'IN_PROGRESS' } }),
  ])

  return { totalBOMs, activeBOMs, totalWOs, activeWOs }
}
