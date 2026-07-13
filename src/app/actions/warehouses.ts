'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const createWarehouseSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  isDefault: z.boolean().default(false),
})

type CreateWarehouseInput = z.input<typeof createWarehouseSchema>

import { getOrgWithModuleCheck } from '@/lib/module-access'

async function getOrganization() {
  const { userId, orgId } = await getOrgWithModuleCheck('INVENTORY')
  return { userId, orgId }
}

export async function getWarehouses() {
  const { orgId } = await getOrganization()
  return prisma.warehouse.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { name: 'asc' },
    include: { _count: { select: { stockLevels: true } } }
  })
}

export async function createWarehouse(input: CreateWarehouseInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createWarehouseSchema.parse(input)

  // If setting as default, unset other defaults
  if (validated.isDefault) {
    await prisma.warehouse.updateMany({
      where: { organizationId: orgId, isDefault: true },
      data: { isDefault: false }
    })
  }

  const warehouse = await prisma.warehouse.create({
    data: {
      ...validated,
      organizationId: orgId,
      createdBy: userId,
    }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'Warehouse', entityId: warehouse.id, newValues: warehouse as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/inventory/warehouses')
  return warehouse
}

export async function deleteWarehouse(id: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.warehouse.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Warehouse not found')

  // Check if warehouse has stock
  const hasStock = await prisma.stockLevel.findFirst({ where: { warehouseId: id, quantity: { gt: 0 } } })
  if (hasStock) throw new Error('Cannot delete warehouse with stock. Transfer stock first.')

  await prisma.warehouse.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId, isActive: false } })
  await logAudit({ organizationId: orgId, userId, action: 'DELETE', entityType: 'Warehouse', entityId: id, oldValues: existing as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/inventory/warehouses')
  return { success: true }
}

export async function getWarehouseDetails(id: string) {
  const { orgId } = await getOrganization()
  
  const warehouse = await prisma.warehouse.findFirst({
    where: { id, organizationId: orgId, deletedAt: null }
  })
  
  if (!warehouse) throw new Error('Warehouse not found')
  
  // Get current stock levels with product information
  const stockLevels = await prisma.stockLevel.findMany({
    where: { warehouseId: id, organizationId: orgId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          barcode: true
        }
      }
    }
  })
  
  // Get all movements related to this warehouse (either from or to)
  const stockMovements = await prisma.stockMovement.findMany({
    where: {
      organizationId: orgId,
      OR: [
        { fromWarehouseId: id },
        { toWarehouseId: id }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          name: true,
          sku: true
        }
      },
      fromWarehouse: { select: { name: true } },
      toWarehouse: { select: { name: true } }
    },
    take: 50
  })
  
  return serializeDecimal({
    warehouse,
    stockLevels,
    stockMovements
  })
}

// We need to import serializeDecimal. Let's make sure it is imported at the top of the file too.
// Wait, we can import it directly inside this function or at the top. Let's do it directly in function for safety or top.
import { serializeDecimal } from '@/lib/utils'
