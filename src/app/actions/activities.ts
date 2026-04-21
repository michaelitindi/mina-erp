'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { serializeDecimal } from '@/lib/utils'

const createActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  duration: z.number().int().positive().nullable().optional(),
  leadId: z.string().nullable().optional(),
  opportunityId: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
})

type CreateActivityInput = z.infer<typeof createActivitySchema>

async function getOrganization() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')
  
  const org = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId }
  })
  if (!org) throw new Error('Organization not found')
  
  return { userId, orgId: org.id }
}

export async function getActivities(filters?: {
  leadId?: string
  opportunityId?: string
  customerId?: string
  status?: string
}) {
  const { orgId } = await getOrganization()

  return serializeDecimal(await prisma.activity.findMany({
    where: {
      organizationId: orgId,
      deletedAt: null,
      ...(filters?.leadId && { leadId: filters.leadId }),
      ...(filters?.opportunityId && { opportunityId: filters.opportunityId }),
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      lead: { select: { firstName: true, lastName: true, companyName: true } },
      opportunity: { select: { name: true } },
      customer: { select: { companyName: true } },
    }
  }))
}

export async function createActivity(input: CreateActivityInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createActivitySchema.parse(input)

  const activity = await prisma.activity.create({
    data: {
      ...validated,
      organizationId: orgId,
      createdBy: userId,
    }
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'CREATE',
    entityType: 'Activity',
    entityId: activity.id,
    newValues: activity as unknown as Record<string, unknown>,
  })

  // Revalidate relevant paths
  if (validated.leadId) revalidatePath(`/dashboard/crm/leads/${validated.leadId}`)
  if (validated.opportunityId) revalidatePath(`/dashboard/crm/opportunities/${validated.opportunityId}`)
  if (validated.customerId) revalidatePath(`/dashboard/crm/customers/${validated.customerId}`)
  
  return serializeDecimal(activity)
}

export async function updateActivityStatus(id: string, status: string) {
  const { userId, orgId } = await getOrganization()

  const existing = await prisma.activity.findFirst({
    where: { id, organizationId: orgId }
  })
  if (!existing) throw new Error('Activity not found')

  const activity = await prisma.activity.update({
    where: { id },
    data: { 
      status, 
      updatedBy: userId,
      completedAt: status === 'COMPLETED' ? new Date() : null
    }
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'UPDATE',
    entityType: 'Activity',
    entityId: id,
    oldValues: { status: existing.status },
    newValues: { status: activity.status },
  })

  return serializeDecimal(activity)
}

export async function deleteActivity(id: string) {
  const { userId, orgId } = await getOrganization()

  const existing = await prisma.activity.findFirst({
    where: { id, organizationId: orgId }
  })
  if (!existing) throw new Error('Activity not found')

  await prisma.activity.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    }
  })

  await logAudit({
    organizationId: orgId,
    userId,
    action: 'DELETE',
    entityType: 'Activity',
    entityId: id,
    oldValues: existing as unknown as Record<string, unknown>,
  })

  return { success: true }
}
