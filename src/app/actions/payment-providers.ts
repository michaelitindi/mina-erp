'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { getAvailableProviders } from '@/lib/payments'

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')
  
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })
  if (!org) throw new Error('Organization not found')
  
  return { userId, orgId: org.id }
}

/**
 * Get all payment providers configured for the organization
 */
export async function getPaymentProviders() {
  const { orgId } = await getOrganization()
  
  return prisma.paymentProvider.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Get available provider types that can be added
 */
export async function getAvailableProviderTypes() {
  const { orgId } = await getOrganization()
  
  // Get already configured providers
  const configured = await prisma.paymentProvider.findMany({
    where: { organizationId: orgId },
    select: { providerType: true },
  })
  const configuredTypes = configured.map(p => p.providerType)
  
  // Filter out already configured ones
  const allProviders = getAvailableProviders()
  return allProviders.filter(p => !configuredTypes.includes(p.type))
}

/**
 * Get providers enabled for a specific channel (POS or E-commerce)
 */
export async function getProvidersForChannel(channel: 'POS' | 'ECOMMERCE') {
  const { orgId } = await getOrganization()
  
  const filter = channel === 'POS' 
    ? { forPOS: true } 
    : { forEcommerce: true }
  
  return prisma.paymentProvider.findMany({
    where: { 
      organizationId: orgId,
      isActive: true,
      ...filter,
    },
    orderBy: { displayName: 'asc' },
  })
}

/**
 * Add a new payment provider
 */
export async function createPaymentProvider(data: {
  providerType: string
  displayName: string
  forPOS: boolean
  forEcommerce: boolean
  config?: Record<string, any>
}) {
  const { orgId } = await getOrganization()
  
  // Check if provider already exists
  const existing = await prisma.paymentProvider.findUnique({
    where: {
      organizationId_providerType: {
        organizationId: orgId,
        providerType: data.providerType,
      },
    },
  })
  if (existing) {
    throw new Error('This payment provider is already configured')
  }
  
  const provider = await prisma.paymentProvider.create({
    data: {
      organizationId: orgId,
      providerType: data.providerType,
      displayName: data.displayName,
      forPOS: data.forPOS,
      forEcommerce: data.forEcommerce,
      config: data.config,
    },
  })
  
  revalidatePath('/dashboard/settings/payments')
  return provider
}

/**
 * Update a payment provider's settings
 */
export async function updatePaymentProvider(
  id: string,
  data: {
    displayName?: string
    isActive?: boolean
    forPOS?: boolean
    forEcommerce?: boolean
    config?: Record<string, any>
  }
) {
  const { orgId } = await getOrganization()
  
  const provider = await prisma.paymentProvider.update({
    where: { id, organizationId: orgId },
    data,
  })
  
  revalidatePath('/dashboard/settings/payments')
  return provider
}

/**
 * Delete a payment provider
 */
export async function deletePaymentProvider(id: string) {
  const { orgId } = await getOrganization()
  
  await prisma.paymentProvider.delete({
    where: { id, organizationId: orgId },
  })
  
  revalidatePath('/dashboard/settings/payments')
}

/**
 * Toggle provider active status
 */
export async function togglePaymentProvider(id: string) {
  const { orgId } = await getOrganization()
  
  const provider = await prisma.paymentProvider.findUnique({
    where: { id, organizationId: orgId },
  })
  if (!provider) throw new Error('Provider not found')
  
  const updated = await prisma.paymentProvider.update({
    where: { id },
    data: { isActive: !provider.isActive },
  })
  
  revalidatePath('/dashboard/settings/payments')
  return updated
}
