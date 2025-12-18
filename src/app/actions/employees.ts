'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  hireDate: z.coerce.date(),
  department: z.string().nullable().optional(),
  position: z.string().min(1),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
  salary: z.number().nonnegative().nullable().optional(),
  payFrequency: z.enum(['WEEKLY', 'BI_WEEKLY', 'MONTHLY']).nullable().optional(),
})

type CreateEmployeeInput = z.input<typeof createEmployeeSchema>

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

async function generateEmployeeNumber(orgId: string): Promise<string> {
  const last = await prisma.employee.findFirst({
    where: { organizationId: orgId },
    orderBy: { employeeNumber: 'desc' },
    select: { employeeNumber: true }
  })
  if (!last) return 'EMP-000001'
  const lastNum = parseInt(last.employeeNumber.replace('EMP-', '')) || 0
  return `EMP-${String(lastNum + 1).padStart(6, '0')}`
}

export async function getEmployees() {
  const { orgId } = await getOrganization()
  return prisma.employee.findMany({
    where: { organizationId: orgId, deletedAt: null },
    orderBy: { lastName: 'asc' },
    include: { 
      manager: { select: { firstName: true, lastName: true } },
      _count: { select: { leaveRequests: true, timesheets: true } }
    }
  })
}

export async function createEmployee(input: CreateEmployeeInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createEmployeeSchema.parse(input)
  const employeeNumber = await generateEmployeeNumber(orgId)

  const employee = await prisma.employee.create({
    data: {
      employeeNumber,
      ...validated,
      salary: validated.salary ? new Decimal(validated.salary) : null,
      organizationId: orgId,
      createdBy: userId,
    }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'Employee', entityId: employee.id, newValues: employee as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/hr/employees')
  return employee
}

export async function updateEmployeeStatus(id: string, status: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.employee.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Employee not found')

  const employee = await prisma.employee.update({
    where: { id },
    data: { 
      status, 
      updatedBy: userId,
      terminationDate: status === 'TERMINATED' ? new Date() : null
    }
  })

  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'Employee', entityId: employee.id, oldValues: { status: existing.status }, newValues: { status: employee.status } })
  revalidatePath('/dashboard/hr/employees')
  return employee
}

export async function deleteEmployee(id: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.employee.findFirst({ where: { id, organizationId: orgId, deletedAt: null } })
  if (!existing) throw new Error('Employee not found')

  await prisma.employee.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId, status: 'TERMINATED' } })
  await logAudit({ organizationId: orgId, userId, action: 'DELETE', entityType: 'Employee', entityId: id, oldValues: existing as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/hr/employees')
  return { success: true }
}

export async function getEmployeeStats() {
  const { orgId } = await getOrganization()
  
  const [total, active, fullTime, partTime] = await Promise.all([
    prisma.employee.count({ where: { organizationId: orgId, deletedAt: null } }),
    prisma.employee.count({ where: { organizationId: orgId, status: 'ACTIVE', deletedAt: null } }),
    prisma.employee.count({ where: { organizationId: orgId, employmentType: 'FULL_TIME', status: 'ACTIVE', deletedAt: null } }),
    prisma.employee.count({ where: { organizationId: orgId, employmentType: 'PART_TIME', status: 'ACTIVE', deletedAt: null } }),
  ])

  return { total, active, fullTime, partTime }
}

// Leave Management
const createLeaveSchema = z.object({
  employeeId: z.string().min(1),
  leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'OTHER']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().nullable().optional(),
})

type CreateLeaveInput = z.input<typeof createLeaveSchema>

export async function getLeaveRequests() {
  const { orgId } = await getOrganization()
  return prisma.leaveRequest.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    include: { employee: { select: { firstName: true, lastName: true, employeeNumber: true } } }
  })
}

export async function createLeaveRequest(input: CreateLeaveInput) {
  const { userId, orgId } = await getOrganization()
  const validated = createLeaveSchema.parse(input)

  const startDate = new Date(validated.startDate)
  const endDate = new Date(validated.endDate)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  const leave = await prisma.leaveRequest.create({
    data: {
      ...validated,
      totalDays: new Decimal(totalDays),
      organizationId: orgId,
      createdBy: userId,
    }
  })

  await logAudit({ organizationId: orgId, userId, action: 'CREATE', entityType: 'LeaveRequest', entityId: leave.id, newValues: leave as unknown as Record<string, unknown> })
  revalidatePath('/dashboard/hr/leave')
  return leave
}

export async function updateLeaveStatus(id: string, status: string, rejectionReason?: string) {
  const { userId, orgId } = await getOrganization()
  const existing = await prisma.leaveRequest.findFirst({ where: { id, organizationId: orgId } })
  if (!existing) throw new Error('Leave request not found')

  const leave = await prisma.leaveRequest.update({
    where: { id },
    data: { 
      status, 
      approvedBy: status === 'APPROVED' ? userId : null,
      approvedAt: status === 'APPROVED' ? new Date() : null,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
    }
  })

  await logAudit({ organizationId: orgId, userId, action: 'UPDATE', entityType: 'LeaveRequest', entityId: leave.id, oldValues: { status: existing.status }, newValues: { status: leave.status } })
  revalidatePath('/dashboard/hr/leave')
  return leave
}
