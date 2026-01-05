'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Decimal } from '@prisma/client/runtime/library'

// Get organization context
async function getOrgContext() {
  const { userId, orgId } = await auth()
  if (!userId || !orgId) throw new Error('Unauthorized')
  
  const org = await prisma.organization.findUnique({ where: { clerkOrgId: orgId } })
  if (!org) throw new Error('Organization not found')
  
  return { userId, orgId: org.id, clerkOrgId: orgId }
}

// ============================================
// EMPLOYEE PROFILE
// ============================================

// Get current user's employee record
export async function getMyEmployee() {
  const { userId, orgId } = await getOrgContext()
  
  const employee = await prisma.employee.findFirst({
    where: { 
      organizationId: orgId, 
      clerkUserId: userId,
      deletedAt: null 
    },
    include: {
      certifications: { orderBy: { issueDate: 'desc' } },
      dependants: { orderBy: { createdAt: 'asc' } },
      bankDetails: true,
      leaveRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
      timesheets: { orderBy: { weekStartDate: 'desc' }, take: 5 },
      payrollRecords: { orderBy: { payPeriodStart: 'desc' }, take: 5 },
      resignations: { orderBy: { createdAt: 'desc' }, take: 1 },
    }
  })
  
  return employee
}

// Update personal info (limited fields)
const updateProfileSchema = z.object({
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
})

export async function updateMyProfile(input: z.infer<typeof updateProfileSchema>) {
  const { userId, orgId } = await getOrgContext()
  const validated = updateProfileSchema.parse(input)
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  await prisma.employee.update({
    where: { id: employee.id },
    data: { ...validated, updatedBy: userId }
  })
  
  revalidatePath('/dashboard/my-portal')
  return { success: true }
}

// ============================================
// CERTIFICATIONS
// ============================================

const certificationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['CERTIFICATION', 'DEGREE', 'SKILL', 'LICENSE']),
  issuer: z.string().nullable().optional(),
  issueDate: z.coerce.date().nullable().optional(),
  expiryDate: z.coerce.date().nullable().optional(),
  credentialId: z.string().nullable().optional(),
})

export async function addCertification(input: z.infer<typeof certificationSchema>) {
  const { userId, orgId } = await getOrgContext()
  const validated = certificationSchema.parse(input)
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  await prisma.employeeCertification.create({
    data: { ...validated, employeeId: employee.id }
  })
  
  revalidatePath('/dashboard/my-portal/professional')
  return { success: true }
}

export async function deleteCertification(id: string) {
  const { userId, orgId } = await getOrgContext()
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  await prisma.employeeCertification.deleteMany({
    where: { id, employeeId: employee.id }
  })
  
  revalidatePath('/dashboard/my-portal/professional')
  return { success: true }
}

// ============================================
// DEPENDANTS
// ============================================

const dependantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  relationship: z.enum(['SPOUSE', 'CHILD', 'PARENT', 'OTHER']),
  dateOfBirth: z.coerce.date().nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  isEmergencyContact: z.boolean().optional(),
  phone: z.string().nullable().optional(),
})

export async function addDependant(input: z.infer<typeof dependantSchema>) {
  const { userId, orgId } = await getOrgContext()
  const validated = dependantSchema.parse(input)
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  await prisma.employeeDependant.create({
    data: { ...validated, employeeId: employee.id }
  })
  
  revalidatePath('/dashboard/my-portal/dependants')
  return { success: true }
}

export async function deleteDependant(id: string) {
  const { userId, orgId } = await getOrgContext()
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  await prisma.employeeDependant.deleteMany({
    where: { id, employeeId: employee.id }
  })
  
  revalidatePath('/dashboard/my-portal/dependants')
  return { success: true }
}

// ============================================
// BANK DETAILS
// ============================================

const bankDetailsSchema = z.object({
  bankName: z.string().min(1),
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  routingNumber: z.string().nullable().optional(),
  swiftCode: z.string().nullable().optional(),
  branchCode: z.string().nullable().optional(),
  accountType: z.enum(['CHECKING', 'SAVINGS']).optional(),
})

export async function updateBankDetails(input: z.infer<typeof bankDetailsSchema>) {
  const { userId, orgId } = await getOrgContext()
  const validated = bankDetailsSchema.parse(input)
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  await prisma.employeeBankDetails.upsert({
    where: { employeeId: employee.id },
    update: validated,
    create: { ...validated, employeeId: employee.id }
  })
  
  revalidatePath('/dashboard/my-portal/bank')
  return { success: true }
}

// ============================================
// LEAVE REQUESTS
// ============================================

const leaveSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'OTHER']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().nullable().optional(),
})

export async function submitMyLeave(input: z.infer<typeof leaveSchema>) {
  const { userId, orgId } = await getOrgContext()
  const validated = leaveSchema.parse(input)
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  const startDate = new Date(validated.startDate)
  const endDate = new Date(validated.endDate)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  
  await prisma.leaveRequest.create({
    data: {
      ...validated,
      employeeId: employee.id,
      organizationId: orgId,
      totalDays: new Decimal(totalDays),
      createdBy: userId,
    }
  })
  
  revalidatePath('/dashboard/my-portal/leaves')
  return { success: true }
}

export async function getMyLeaveRequests() {
  const { userId, orgId } = await getOrgContext()
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) return []
  
  return prisma.leaveRequest.findMany({
    where: { employeeId: employee.id },
    orderBy: { createdAt: 'desc' }
  })
}

// ============================================
// TIMESHEETS
// ============================================

export async function getMyTimesheets() {
  const { userId, orgId } = await getOrgContext()
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) return []
  
  return prisma.timesheet.findMany({
    where: { employeeId: employee.id },
    orderBy: { weekStartDate: 'desc' },
    include: { entries: true }
  })
}

// ============================================
// PAYSLIPS
// ============================================

export async function getMyPayslips() {
  const { userId, orgId } = await getOrgContext()
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) return []
  
  return prisma.payrollRecord.findMany({
    where: { employeeId: employee.id, status: 'PAID' },
    orderBy: { payPeriodStart: 'desc' }
  })
}

// ============================================
// RESIGNATION
// ============================================

const resignationSchema = z.object({
  lastWorkingDate: z.coerce.date(),
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function submitResignation(input: z.infer<typeof resignationSchema>) {
  const { userId, orgId } = await getOrgContext()
  const validated = resignationSchema.parse(input)
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  // Check for pending resignation
  const existing = await prisma.resignationRequest.findFirst({
    where: { employeeId: employee.id, status: 'PENDING' }
  })
  if (existing) throw new Error('You already have a pending resignation request')
  
  await prisma.resignationRequest.create({
    data: {
      ...validated,
      employeeId: employee.id,
      organizationId: orgId,
    }
  })
  
  revalidatePath('/dashboard/my-portal/resignation')
  return { success: true }
}

export async function withdrawResignation(id: string) {
  const { userId, orgId } = await getOrgContext()
  
  const employee = await prisma.employee.findFirst({
    where: { organizationId: orgId, clerkUserId: userId, deletedAt: null }
  })
  if (!employee) throw new Error('Employee record not found')
  
  await prisma.resignationRequest.updateMany({
    where: { id, employeeId: employee.id, status: 'PENDING' },
    data: { status: 'WITHDRAWN' }
  })
  
  revalidatePath('/dashboard/my-portal/resignation')
  return { success: true }
}
