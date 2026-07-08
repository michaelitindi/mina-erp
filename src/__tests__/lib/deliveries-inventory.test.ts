import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDelivery, updateDeliveryStatus } from '@/app/actions/deliveries'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// Mock the whole prisma structure needed for these tests
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
      warehouse: {
        findFirst: vi.fn(),
      },
      delivery: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      salesOrder: {
        update: vi.fn(),
      },
      stockLevel: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      stockMovement: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      product: {
        findMany: vi.fn(),
      }
    }
  }
})

// Mock logAudit to prevent Next.js headers request scope errors in Vitest
vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}))

describe('Sales Deliveries & Inventory Integration', () => {
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
      enabledModules: ['SALES'],
    })

    // Mock $transaction to run callback immediately
    prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
      return callback(prisma)
    })
  })

  describe('createDelivery', () => {
    it('should map SKUs to product IDs and create a delivery', async () => {
      const mockInput = {
        salesOrderId: 'so-123',
        carrier: 'DHL',
        trackingNumber: 'TRK-999',
        shippingAddress: '123 Main St',
        shippingCity: 'Nairobi',
        shippingCountry: 'Kenya',
        items: [
          { description: 'Laptop A', sku: 'SKU-LAPTOP-A', quantity: 2 }
        ]
      }

      // Mock product lookup matching the SKU
      vi.mocked(prisma.product.findMany).mockResolvedValueOnce([
        { id: 'prod-laptop-a', sku: 'SKU-LAPTOP-A' }
      ] as any)

      vi.mocked(prisma.delivery.create).mockResolvedValueOnce({
        id: 'del-123',
        deliveryNumber: 'DEL-000001',
        ...mockInput,
        items: mockInput.items.map(item => ({ ...item, quantity: new Decimal(item.quantity), productId: 'prod-laptop-a' }))
      } as any)

      const result = await createDelivery(mockInput)
      expect(result.id).toBe('del-123')
      expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          sku: { in: ['SKU-LAPTOP-A'] }
        })
      }))
    })
  })

  describe('updateDeliveryStatus', () => {
    it('should throw an error if no warehouse is registered in the organization when completing', async () => {
      vi.mocked(prisma.delivery.findFirst).mockResolvedValueOnce({
        id: 'del-123',
        deliveryNumber: 'DEL-000001',
        salesOrderId: 'so-123'
      } as any)

      // Mock no warehouse registered
      vi.mocked(prisma.warehouse.findFirst).mockResolvedValueOnce(null)

      await expect(updateDeliveryStatus('del-123', 'DELIVERED')).rejects.toThrow(
        'A warehouse must be registered before shipments can be processed.'
      )
    })

    it('should throw an error if there is insufficient stock in the warehouse', async () => {
      const existingDelivery = {
        id: 'del-123',
        deliveryNumber: 'DEL-000001',
        salesOrderId: 'so-123',
        items: [
          { productId: 'prod-laptop-a', description: 'Laptop A', quantity: new Decimal(5) }
        ]
      }

      vi.mocked(prisma.delivery.findFirst)
        .mockResolvedValueOnce(existingDelivery as any) // for first lookup
        .mockResolvedValueOnce(existingDelivery as any) // for nested include items lookup

      vi.mocked(prisma.warehouse.findFirst).mockResolvedValueOnce({ id: 'wh-123' } as any)
      
      // Mock stock level is less than required (e.g. 3 available, 5 required)
      vi.mocked(prisma.stockLevel.findUnique).mockResolvedValueOnce({
        quantity: new Decimal(3)
      } as any)

      await expect(updateDeliveryStatus('del-123', 'DELIVERED')).rejects.toThrow(
        'Insufficient stock for product "Laptop A". Required: 5, Available: 3'
      )
    })

    it('should decrement stock and log a stock movement OUT on DELIVERED transition', async () => {
      const existingDelivery = {
        id: 'del-123',
        deliveryNumber: 'DEL-000001',
        salesOrderId: 'so-123',
        items: [
          { productId: 'prod-laptop-a', description: 'Laptop A', quantity: new Decimal(2) }
        ]
      }

      vi.mocked(prisma.delivery.findFirst)
        .mockResolvedValueOnce(existingDelivery as any)
        .mockResolvedValueOnce(existingDelivery as any)

      vi.mocked(prisma.warehouse.findFirst).mockResolvedValueOnce({ id: 'wh-123' } as any)
      
      // Sufficient stock available (e.g., 10 available)
      vi.mocked(prisma.stockLevel.findUnique).mockResolvedValueOnce({
        quantity: new Decimal(10)
      } as any)

      vi.mocked(prisma.stockMovement.findFirst).mockResolvedValueOnce({
        movementNumber: 'SM-000020'
      } as any)

      vi.mocked(prisma.delivery.findUnique).mockResolvedValueOnce({
        id: 'del-123',
        status: 'DELIVERED'
      } as any)

      const result = await updateDeliveryStatus('del-123', 'DELIVERED')
      expect(result!.status).toBe('DELIVERED')

      // Verify stock level decrement was called
      expect(prisma.stockLevel.update).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          productId_warehouseId: {
            productId: 'prod-laptop-a',
            warehouseId: 'wh-123'
          }
        },
        data: expect.objectContaining({
          quantity: { decrement: 2 },
          availableQty: { decrement: 2 }
        })
      }))

      // Verify stock movement OUT was logged
      expect(prisma.stockMovement.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          productId: 'prod-laptop-a',
          type: 'OUT',
          reason: 'SALE',
          quantity: new Decimal(-2),
          fromWarehouseId: 'wh-123'
        })
      }))
    })
  })
})
