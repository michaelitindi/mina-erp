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

  // Seed default Chart of Accounts for the tenant
  try {
    const { seedDefaultAccounts } = await import('@/lib/finance-seed')
    await seedDefaultAccounts(prisma, org.id, userId)
  } catch (err) {
    console.error('Failed to seed default Chart of Accounts during onboarding:', err)
  }

  // Auto-provision admin employee profile
  try {
    const { currentUser } = await import('@clerk/nextjs/server')
    const user = await currentUser()
    if (user) {
      const firstName = user.firstName || 'Admin'
      const lastName = user.lastName || 'User'
      const email = user.emailAddresses[0]?.emailAddress || ''
      
      const last = await prisma.employee.findFirst({
        where: { organizationId: org.id },
        orderBy: { employeeNumber: 'desc' },
        select: { employeeNumber: true }
      })
      let employeeNumber = 'EMP-000001'
      if (last) {
        const lastNum = parseInt(last.employeeNumber.replace('EMP-', '')) || 0
        employeeNumber = `EMP-${String(lastNum + 1).padStart(6, '0')}`
      }

      // Check if employee record already exists
      const existingEmployee = await prisma.employee.findFirst({
        where: { organizationId: org.id, clerkUserId: userId, deletedAt: null }
      })

      if (!existingEmployee) {
        await prisma.employee.create({
          data: {
            organizationId: org.id,
            clerkUserId: userId,
            employeeNumber,
            firstName,
            lastName,
            email,
            position: 'Administrator',
            employmentType: 'FULL_TIME',
            hireDate: new Date(),
            status: 'ACTIVE',
            createdBy: userId
          }
        })
      }
    }
  } catch (err) {
    console.error('Failed to auto-provision admin employee profile during onboarding:', err)
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
