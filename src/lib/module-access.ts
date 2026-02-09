import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/roles'
import { ForbiddenError } from '@/lib/errors'

/**
 * Check if the current user has access to a specific module.
 * Admins always have access. Members need the module in their allowedModules.
 * 
 * @param requiredModule - The module key to check (e.g., 'SALES', 'CRM', 'HR')
 * @returns true if user has access, redirects to /dashboard otherwise
 */
export async function checkModuleAccess(requiredModule: string): Promise<boolean> {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId || !orgId) {
    redirect('/sign-in')
  }
  
  // Admins always have access
  if (isAdmin(orgRole)) {
    return true
  }
  
  // For members, check their allowed modules
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true, enabledModules: true }
  })
  
  if (!org) {
    redirect('/dashboard')
  }
  
  // Check if module is enabled for organization
  if (!org.enabledModules.includes(requiredModule)) {
    redirect('/dashboard')
  }
  
  // Check if employee has access to this module
  const employee = await prisma.employee.findFirst({
    where: { 
      organizationId: org.id, 
      clerkUserId: userId,
      deletedAt: null 
    },
    select: { allowedModules: true }
  })
  
  if (!employee || !employee.allowedModules.includes(requiredModule)) {
    redirect('/dashboard')
  }
  
  return true
}

/**
 * Check if member has any modules assigned (not pending setup).
 * Returns false and redirects if no modules assigned.
 */
export async function checkNotPendingSetup(): Promise<boolean> {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId || !orgId) {
    redirect('/sign-in')
  }
  
  // Admins are never in pending setup
  if (isAdmin(orgRole)) {
    return true
  }
  
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true }
  })
  
  if (!org) {
    redirect('/dashboard')
  }
  
  const employee = await prisma.employee.findFirst({
    where: { 
      organizationId: org.id, 
      clerkUserId: userId,
      deletedAt: null 
    },
    select: { allowedModules: true }
  })
  
  // If no modules assigned, redirect to dashboard (pending setup screen)
  if (!employee || employee.allowedModules.length === 0) {
    redirect('/dashboard')
  }
  
  return true
}

/**
 * Check module access for server actions (throws error instead of redirect).
 * Use this in server actions to enforce module-level access control.
 * 
 * @param requiredModule - The module key to check
 * @param orgId - The internal organization ID (from getOrganization)
 * @param userId - The Clerk user ID
 * @param orgRole - The user's organization role
 * @throws ForbiddenError if access is denied
 */
export async function checkModuleEnabled(
  requiredModule: string,
  orgId: string,
  userId: string,
  orgRole?: string | null
): Promise<void> {
  // Admins always have access
  if (isAdmin(orgRole)) {
    return
  }
  
  // Get organization with enabled modules
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { enabledModules: true }
  })
  
  if (!org || !org.enabledModules.includes(requiredModule)) {
    throw new ForbiddenError(`Module ${requiredModule} is not enabled for this organization`)
  }
  
  // Check if employee has access
  const employee = await prisma.employee.findFirst({
    where: { 
      organizationId: orgId, 
      clerkUserId: userId,
      deletedAt: null 
    },
    select: { allowedModules: true }
  })
  
  if (!employee || !employee.allowedModules.includes(requiredModule)) {
    throw new ForbiddenError(`You do not have access to the ${requiredModule} module`)
  }
}

/**
 * Quick module check helper for common use case
 * Returns organization and checks module access in one call
 */
export async function getOrgWithModuleCheck(requiredModule: string) {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId || !orgId) {
    throw new ForbiddenError('Unauthorized')
  }
  
  let org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })
  
  if (!org) {
    org = await prisma.organization.create({
      data: {
        clerkOrgId: orgId,
        name: 'My Organization',
        slug: orgId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      }
    })
  }
  
  await checkModuleEnabled(requiredModule, org.id, userId, orgRole)
  
  return { userId, orgId: org.id, orgRole }
}
