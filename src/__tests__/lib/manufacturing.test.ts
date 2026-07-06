import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateWorkOrderStatus, createWorkOrder } from '@/app/actions/manufacturing'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// Mock the whole prisma structure needed for this test
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      organization: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      employee: {
        findFirst: vi.fn(),
      },
      workOrder: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      stockLevel: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      stockMovement: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    }
  }
})

// Mock logAudit to prevent Next.js headers request scope errors in Vitest
vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}))

describe('Manufacturing Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock default auth values
    vi.mocked(auth).mockResolvedValue({
      userId: 'test-user-id',
      orgId: 'clerk-org-id',
      orgRole: 'org:admin',
    } as any)
    
    // Mock module check defaults
    prisma.organization.findUnique = vi.fn().mockResolvedValue({
      id: 'db-org-id',
      enabledModules: ['MANUFACTURING'],
    })
  })

  describe('updateWorkOrderStatus', () => {
    it('should throw an error if work order not found', async () => {
      vi.mocked(prisma.workOrder.findFirst).mockResolvedValueOnce(null)
      await expect(updateWorkOrderStatus('invalid-id', 'IN_PROGRESS')).rejects.toThrow('Work order not found')
    })

    it('should throw an error if transitioning to IN_PROGRESS without warehouseId', async () => {
      const mockWO = {
        id: 'wo-id',
        workOrderNumber: 'WO-000001',
        bomId: 'bom-id',
        productId: 'product-id',
        quantity: new Decimal(10),
        status: 'PLANNED',
        warehouseId: null, // missing warehouseId
        bom: {
          components: [
            { productId: 'comp-1', description: 'Component 1', quantity: new Decimal(2), wastagePercent: new Decimal(0) }
          ]
        }
      }

      vi.mocked(prisma.workOrder.findFirst).mockResolvedValueOnce(mockWO as any)
      await expect(updateWorkOrderStatus('wo-id', 'IN_PROGRESS')).rejects.toThrow(
        'A warehouse must be assigned to the work order before starting or completing production'
      )
    })

    it('should throw an error if there is a raw material shortage', async () => {
      const mockWO = {
        id: 'wo-id',
        workOrderNumber: 'WO-000001',
        bomId: 'bom-id',
        productId: 'finished-prod',
        quantity: new Decimal(10),
        status: 'PLANNED',
        warehouseId: 'warehouse-1',
        bom: {
          components: [
            { productId: 'comp-1', description: 'Raw Material A', quantity: new Decimal(2), wastagePercent: new Decimal(10) } // requires 10 * 2 * 1.1 = 22
          ]
        }
      }

      vi.mocked(prisma.workOrder.findFirst).mockResolvedValueOnce(mockWO as any)
      // Mock stock level to be less than required (e.g., 20 available, 22 required)
      vi.mocked(prisma.stockLevel.findUnique).mockResolvedValueOnce({
        quantity: new Decimal(20),
      } as any)

      await expect(updateWorkOrderStatus('wo-id', 'IN_PROGRESS')).rejects.toThrow(
        'Insufficient stock for component "Raw Material A". Required: 22.00, Available: 20.00'
      )
    })

    it('should pass checks when stock is sufficient', async () => {
      const mockWO = {
        id: 'wo-id',
        workOrderNumber: 'WO-000001',
        bomId: 'bom-id',
        productId: 'finished-prod',
        quantity: new Decimal(5),
        status: 'PLANNED',
        warehouseId: 'warehouse-1',
        bom: {
          components: [
            { productId: 'comp-1', description: 'Raw Material A', quantity: new Decimal(2), wastagePercent: new Decimal(0) } // requires 10
          ]
        }
      }

      vi.mocked(prisma.workOrder.findFirst).mockResolvedValueOnce(mockWO as any)
      vi.mocked(prisma.stockLevel.findUnique).mockResolvedValueOnce({
        quantity: new Decimal(15), // sufficient
      } as any)

      vi.mocked(prisma.workOrder.update).mockResolvedValueOnce({
        ...mockWO,
        status: 'IN_PROGRESS',
      } as any)

      vi.mocked(prisma.workOrder.findUnique).mockResolvedValueOnce({
        id: 'wo-id',
        status: 'IN_PROGRESS',
      } as any)

      const result = await updateWorkOrderStatus('wo-id', 'IN_PROGRESS')
      expect(result?.status).toBe('IN_PROGRESS')
    })

    it('should perform stock level decrements for components and increments for finished goods when COMPLETED', async () => {
      const mockWO = {
        id: 'wo-id',
        workOrderNumber: 'WO-000001',
        bomId: 'bom-id',
        productId: 'finished-prod',
        quantity: new Decimal(10),
        status: 'IN_PROGRESS',
        warehouseId: 'warehouse-1',
        bom: {
          components: [
            { productId: 'comp-1', description: 'Raw Material A', quantity: new Decimal(2), wastagePercent: new Decimal(0) }
          ]
        }
      }

      vi.mocked(prisma.workOrder.findFirst).mockResolvedValueOnce(mockWO as any)
      vi.mocked(prisma.stockLevel.findUnique).mockResolvedValueOnce({
        quantity: new Decimal(50),
      } as any)

      // Mock $transaction to run the callback using the prisma mock
      prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
        return callback(prisma)
      })

      // Mock generateSMNumber values
      vi.mocked(prisma.stockMovement.findFirst).mockResolvedValueOnce({
        movementNumber: 'SM-000100',
      } as any)

      vi.mocked(prisma.workOrder.update).mockResolvedValueOnce({
        ...mockWO,
        status: 'COMPLETED',
      } as any)

      vi.mocked(prisma.workOrder.findUnique).mockResolvedValueOnce({
        id: 'wo-id',
        status: 'COMPLETED',
      } as any)

      const result = await updateWorkOrderStatus('wo-id', 'COMPLETED')
      expect(result?.status).toBe('COMPLETED')

      // Verify stock movement for component OUT was created
      expect(prisma.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'comp-1',
          type: 'OUT',
          reason: 'MANUFACTURING',
          quantity: new Decimal(-20), // 10 WO qty * 2 component qty
          fromWarehouseId: 'warehouse-1',
        })
      })

      // Verify stock level decrement upsert was called
      expect(prisma.stockLevel.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          productId_warehouseId: {
            productId: 'comp-1',
            warehouseId: 'warehouse-1'
          }
        }
      }))

      // Verify stock movement for finished product IN was created
      expect(prisma.stockMovement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'finished-prod',
          type: 'IN',
          reason: 'MANUFACTURING',
          quantity: new Decimal(10),
          toWarehouseId: 'warehouse-1',
        })
      })
    })
  })
})
