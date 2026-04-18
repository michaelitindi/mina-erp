'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const updateEtimsSchema = z.object({
  pinNumber: z.string().min(1, 'KRA PIN is required'),
  etimsDeviceId: z.string().nullable().optional(),
  etimsSerialNumber: z.string().nullable().optional(),
  etimsSecurityKey: z.string().nullable().optional(),
  etimsMode: z.enum(['SIMULATION', 'SANDBOX', 'PRODUCTION']).default('SIMULATION'),
})

type UpdateEtimsInput = z.infer<typeof updateEtimsSchema>

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')

  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })

  if (!org) throw new Error('Organization not found')
  return { userId, orgId: org.id, existing: org }
}

export async function updateEtimsSettings(input: UpdateEtimsInput) {
  const { userId, orgId, existing } = await getOrganization()
  const validated = updateEtimsSchema.parse(input)

  const updated = await prisma.organization.update({
    where: { id: orgId },
    data: {
      pinNumber: validated.pinNumber,
      etimsDeviceId: validated.etimsDeviceId,
      etimsSerialNumber: validated.etimsSerialNumber,
      etimsSecurityKey: validated.etimsSecurityKey,
      etimsMode: validated.etimsMode,
    }
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'UPDATE',
    entityType: 'Organization',
    entityId: orgId,
    oldValues: {
      pinNumber: existing.pinNumber,
      etimsMode: existing.etimsMode
    },
    newValues: {
      pinNumber: updated.pinNumber,
      etimsMode: updated.etimsMode
    }
  })

  revalidatePath('/dashboard/settings/etims')
  return { success: true }
}

export async function getOrganizationSettings() {
  const { orgId } = await getOrganization()
  return prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      name: true,
      pinNumber: true,
      etimsDeviceId: true,
      etimsSerialNumber: true,
      etimsSecurityKey: true,
      etimsMode: true,
    }
  })
}
