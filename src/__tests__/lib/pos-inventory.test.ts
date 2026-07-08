import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSale, voidSale } from '@/app/actions/pos'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// Mock the whole prisma structure needed for these tests
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      organization: {
        findUnique: vi.fn(),
      },
      warehouse: {
        findFirst: vi.fn(),
      },
      pOSTerminal: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      pOSSale: {
        count: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      stockLevel: {
        upsert: vi.fn(),
      },
      stockMovement: {
        count: vi.fn(),
        create: vi.fn(),
      }
    }
  }
})

// Mock logAudit to prevent Next.js headers request scope errors in Vitest
vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}))

describe('POS & Inventory Stock Integration', () => {
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
      enabledModules: ['POS'],
    })

    // Mock $transaction to run callback immediately
    prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
      return callback(prisma)
    })
  })

  describe('createSale', () => {
    it('should throw an error if no warehouse is registered', async () => {
      const mockSaleInput = {
        sessionId: 'session-123',
        items: [{ productId: 'prod-1', productName: 'Item A', quantity: 2, unitPrice: 10 }],
        payments: [{ providerType: 'CASH', method: 'cash', amount: 20 }]
      }

      vi.mocked(prisma.pOSSale.count).mockResolvedValueOnce(0)
      vi.mocked(prisma.pOSSale.create).mockResolvedValueOnce({ id: 'sale-123', saleNumber: 'POS-000001' } as any)
      vi.mocked(prisma.warehouse.findFirst).mockResolvedValueOnce(null) // no warehouse

      await expect(createSale(mockSaleInput)).rejects.toThrow(
        'A warehouse must be registered before POS sales can be processed.'
      )
    })

    it('should deduct stock from default warehouse and create OUT movement referencing the warehouse', async () => {
      const mockSaleInput = {
        sessionId: 'session-123',
        items: [{ productId: 'prod-1', productName: 'Item A', quantity: 2, unitPrice: 10 }],
        payments: [{ providerType: 'CASH', method: 'cash', amount: 20 }]
      }

      vi.mocked(prisma.pOSSale.count).mockResolvedValueOnce(0)
      vi.mocked(prisma.pOSSale.create).mockResolvedValueOnce({ id: 'sale-123', saleNumber: 'POS-000001' } as any)
      vi.mocked(prisma.warehouse.findFirst).mockResolvedValueOnce({ id: 'wh-123' } as any)
      vi.mocked(prisma.stockMovement.count).mockResolvedValueOnce(0)

      const result = await createSale(mockSaleInput)
      expect(result.id).toBe('sale-123')

      // Verify stockLevel.upsert was called for the default warehouse
      expect(prisma.stockLevel.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          productId_warehouseId: {
            productId: 'prod-1',
            warehouseId: 'wh-123'
          }
        },
        update: expect.objectContaining({
          quantity: { decrement: 2 }
        })
      }))

      // Verify stockMovement was logged OUT pointing to wh-123
      expect(prisma.stockMovement.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          productId: 'prod-1',
          type: 'OUT',
          reason: 'SALE',
          quantity: -2,
          fromWarehouseId: 'wh-123'
        })
      }))
    })
  })

  describe('voidSale', () => {
    it('should restore stock to default warehouse and log IN movement pointing to warehouse', async () => {
      const mockSale = {
        id: 'sale-123',
        saleNumber: 'POS-000001',
        status: 'PAID',
        items: [
          { productId: 'prod-1', quantity: 2 }
        ]
      }

      vi.mocked(prisma.pOSSale.findUnique).mockResolvedValueOnce(mockSale as any)
      vi.mocked(prisma.warehouse.findFirst).mockResolvedValueOnce({ id: 'wh-123' } as any)
      vi.mocked(prisma.stockMovement.count).mockResolvedValueOnce(0)
      vi.mocked(prisma.pOSSale.update).mockResolvedValueOnce({ ...mockSale, status: 'VOIDED' } as any)

      const result = await voidSale('sale-123', 'Customer cancelled')
      expect(result.status).toBe('VOIDED')

      // Verify stockLevel.upsert was called to restore stock to default warehouse
      expect(prisma.stockLevel.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          productId_warehouseId: {
            productId: 'prod-1',
            warehouseId: 'wh-123'
          }
        },
        update: expect.objectContaining({
          quantity: { increment: 2 }
        })
      }))

      // Verify stockMovement was logged IN pointing to wh-123
      expect(prisma.stockMovement.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          productId: 'prod-1',
          type: 'IN',
          reason: 'RETURN',
          quantity: 2,
          toWarehouseId: 'wh-123'
        })
      }))
    })
  })
})
