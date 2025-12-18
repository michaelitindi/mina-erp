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
