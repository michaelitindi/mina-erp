import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkModuleAccess, checkModuleEnabled, getOrgWithModuleCheck } from '@/lib/module-access'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ForbiddenError } from '@/lib/errors'

// Mock next/navigation specifically for redirect testing
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirected to ${url}`)
  }),
}))

describe('Module Access Checks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkModuleAccess', () => {
    it('should allow access if user is Admin', async () => {
      // Mock auth to return admin role
      vi.mocked(auth).mockResolvedValueOnce({
        userId: 'admin-user',
        orgId: 'org-123',
        orgRole: 'org:admin',
      } as any)

      const result = await checkModuleAccess('FINANCE')
      expect(result).toBe(true)
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should redirect to sign-in if not authenticated', async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        userId: null,
        orgId: null,
      } as any)

      await expect(checkModuleAccess('FINANCE')).rejects.toThrow('Redirected to /sign-in')
      expect(redirect).toHaveBeenCalledWith('/sign-in')
    })

    it('should allow access if member and module is enabled/allowed', async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        userId: 'member-user',
        orgId: 'org-123',
        orgRole: 'org:member',
      } as any)

      // Mock organization having module enabled
      prisma.organization.findUnique = vi.fn().mockResolvedValueOnce({
        id: 'db-org-123',
        enabledModules: ['FINANCE', 'CRM'],
      })

      // Mock employee allowed modules
      vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce({
        allowedModules: ['FINANCE'],
      } as any)

      const result = await checkModuleAccess('FINANCE')
      expect(result).toBe(true)
      expect(redirect).not.toHaveBeenCalled()
    })

    it('should redirect if module is not enabled for organization', async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        userId: 'member-user',
        orgId: 'org-123',
        orgRole: 'org:member',
      } as any)

      prisma.organization.findUnique = vi.fn().mockResolvedValueOnce({
        id: 'db-org-123',
        enabledModules: ['CRM'], // FINANCE not enabled
      })

      await expect(checkModuleAccess('FINANCE')).rejects.toThrow('Redirected to /dashboard')
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })

    it('should redirect if employee does not have allowedModule assigned', async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        userId: 'member-user',
        orgId: 'org-123',
        orgRole: 'org:member',
      } as any)

      prisma.organization.findUnique = vi.fn().mockResolvedValueOnce({
        id: 'db-org-123',
        enabledModules: ['FINANCE'],
      })

      vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce({
        allowedModules: ['CRM'], // FINANCE not allowed for employee
      } as any)

      await expect(checkModuleAccess('FINANCE')).rejects.toThrow('Redirected to /dashboard')
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('checkModuleEnabled', () => {
    it('should pass silently if user is admin', async () => {
      await expect(
        checkModuleEnabled('FINANCE', 'org-123', 'admin-user', 'org:admin')
      ).resolves.not.toThrow()
    })

    it('should throw ForbiddenError if module is not enabled for organization', async () => {
      prisma.organization.findUnique = vi.fn().mockResolvedValueOnce({
        enabledModules: ['CRM'],
      })

      await expect(
        checkModuleEnabled('FINANCE', 'org-123', 'member-user', 'org:member')
      ).rejects.toThrow(ForbiddenError)
    })

    it('should throw ForbiddenError if employee does not have module allowed', async () => {
      prisma.organization.findUnique = vi.fn().mockResolvedValueOnce({
        enabledModules: ['FINANCE'],
      })

      vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce({
        allowedModules: ['CRM'],
      } as any)

      await expect(
        checkModuleEnabled('FINANCE', 'org-123', 'member-user', 'org:member')
      ).rejects.toThrow(ForbiddenError)
    })

    it('should resolve successfully if user is authorized member', async () => {
      prisma.organization.findUnique = vi.fn().mockResolvedValueOnce({
        enabledModules: ['FINANCE'],
      })

      vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce({
        allowedModules: ['FINANCE'],
      } as any)

      await expect(
        checkModuleEnabled('FINANCE', 'org-123', 'member-user', 'org:member')
      ).resolves.not.toThrow()
    })
  })

  describe('getOrgWithModuleCheck', () => {
    it('should return org context and check module access successfully', async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        userId: 'member-user',
        orgId: 'org-123',
        orgRole: 'org:member',
      } as any)

      prisma.organization.findUnique = vi.fn()
        .mockResolvedValueOnce({
          id: 'db-org-123',
          enabledModules: ['FINANCE'],
        }) // inside getOrgWithModuleCheck (findUnique organization)
        .mockResolvedValueOnce({
          id: 'db-org-123',
          enabledModules: ['FINANCE'],
        }) // inside checkModuleEnabled (findUnique organization)

      vi.mocked(prisma.employee.findFirst).mockResolvedValueOnce({
        allowedModules: ['FINANCE'],
      } as any)

      const result = await getOrgWithModuleCheck('FINANCE')
      expect(result.orgId).toBe('db-org-123')
      expect(result.userId).toBe('member-user')
    })
  })
})
