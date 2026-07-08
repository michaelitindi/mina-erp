'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getOrganizationWithModules() {
  const { orgId } = await auth()
  if (!orgId) return null

  return prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: {
      id: true,
      enabledModules: true,
      onboardingComplete: true,
    }
  })
}

export async function completeOnboarding(data: {
  name: string
  country: string
  currency: string
  modules: string[]
}) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')

  // Ensure fields are provided
  if (!data.name) {
    throw new Error('Organization name is required')
  }
  if (!data.country) {
    throw new Error('Country is required')
  }
  if (!data.currency) {
    throw new Error('Currency is required')
  }
  if (data.modules.length === 0) {
    throw new Error('Please select at least one module')
  }

  // Get or create organization
  let org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })

  if (!org) {
    org = await prisma.organization.create({
      data: {
        clerkOrgId: orgId,
        name: data.name,
        slug: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${orgId.toLowerCase().slice(-6)}`,
        country: data.country,
        currency: data.currency,
        enabledModules: data.modules,
        onboardingComplete: true,
      }
    })
  } else {
    org = await prisma.organization.update({
      where: { clerkOrgId: orgId },
      data: {
        name: data.name,
        country: data.country,
        currency: data.currency,
        enabledModules: data.modules,
        onboardingComplete: true,
      }
    })
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function updateEnabledModules(modules: string[]) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')

  if (modules.length === 0) {
    throw new Error('Please select at least one module')
  }

  await prisma.organization.update({
    where: { clerkOrgId: orgId },
    data: { enabledModules: modules }
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
}
