'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
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

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  website: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  currency: z.string().default('USD'),
  timezone: z.string().default('UTC'),
  country: z.string().default('US'),
})

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export async function getFullOrganizationSettings() {
  const { orgId, existing } = await getOrganization()
  
  // Sync name from Clerk in case it was updated on Clerk's dashboard
  try {
    const client = await clerkClient()
    const clerkOrg = await client.organizations.getOrganization({
      organizationId: existing.clerkOrgId
    })
    if (clerkOrg && clerkOrg.name !== existing.name) {
      await prisma.organization.update({
        where: { id: orgId },
        data: { name: clerkOrg.name }
      })
      existing.name = clerkOrg.name
    }
  } catch (e) {
    console.error("Clerk sync failed:", e)
  }

  return prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      name: true,
      website: true,
      industry: true,
      currency: true,
      timezone: true,
      country: true,
      logo: true,
    }
  })
}

export async function updateOrganizationProfile(input: UpdateProfileInput) {
  const { userId, orgId, existing } = await getOrganization()
  const validated = updateProfileSchema.parse(input)

  // Sync to Clerk
  try {
    const client = await clerkClient()
    await client.organizations.updateOrganization(existing.clerkOrgId, {
      name: validated.name
    })
  } catch (e) {
    console.error("Failed to sync organization name to Clerk:", e)
  }

  const updated = await prisma.organization.update({
    where: { id: orgId },
    data: {
      name: validated.name,
      website: validated.website,
      industry: validated.industry,
      currency: validated.currency,
      timezone: validated.timezone,
      country: validated.country,
    }
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'UPDATE',
    entityType: 'Organization',
    entityId: orgId,
    oldValues: {
      name: existing.name,
      website: existing.website,
      industry: existing.industry,
      currency: existing.currency,
      timezone: existing.timezone,
      country: existing.country,
    },
    newValues: {
      name: updated.name,
      website: updated.website,
      industry: updated.industry,
      currency: updated.currency,
      timezone: updated.timezone,
      country: updated.country,
    }
  })

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard/settings/profile')
  return { success: true }
}

