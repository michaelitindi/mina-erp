'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ModuleType = 
  | 'FINANCE' 
  | 'CRM' 
  | 'SALES' 
  | 'INVENTORY' 
  | 'PROCUREMENT' 
  | 'HR' 
  | 'ASSETS' 
  | 'PROJECTS' 
  | 'DOCUMENTS' 
  | 'MANUFACTURING' 
  | 'ECOMMERCE'

export const ALL_MODULES: { id: ModuleType; name: string; description: string; icon: string }[] = [
  { id: 'FINANCE', name: 'Finance', description: 'Invoices, bills, payments & budgets', icon: '💰' },
  { id: 'CRM', name: 'CRM', description: 'Customers, vendors, leads & opportunities', icon: '👥' },
  { id: 'SALES', name: 'Sales', description: 'Sales orders & shipments', icon: '🛒' },
  { id: 'INVENTORY', name: 'Inventory', description: 'Products, warehouses & stock', icon: '📦' },
  { id: 'PROCUREMENT', name: 'Procurement', description: 'Purchase orders & receiving', icon: '🛍️' },
  { id: 'HR', name: 'HR', description: 'Employees, leave & payroll', icon: '👤' },
  { id: 'ASSETS', name: 'Assets', description: 'Track company assets', icon: '💾' },
  { id: 'PROJECTS', name: 'Projects', description: 'Project management', icon: '📁' },
  { id: 'DOCUMENTS', name: 'Documents', description: 'Document storage', icon: '📄' },
  { id: 'MANUFACTURING', name: 'Manufacturing', description: 'BOM & work orders', icon: '🏭' },
  { id: 'ECOMMERCE', name: 'E-Commerce', description: 'Online stores', icon: '🏪' },
]

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

export async function completeOnboarding(modules: string[]) {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')

  // Ensure at least one module is selected
  if (modules.length === 0) {
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
        name: 'My Organization',
        slug: orgId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        enabledModules: modules,
        onboardingComplete: true,
      }
    })
  } else {
    org = await prisma.organization.update({
      where: { clerkOrgId: orgId },
      data: {
        enabledModules: modules,
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
