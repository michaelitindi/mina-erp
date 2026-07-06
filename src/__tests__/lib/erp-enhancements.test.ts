import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGoodsReceipt, updateGoodsReceiptStatus } from '@/app/actions/goods-receipts'
import { calculateDepreciation } from '@/app/actions/assets'
import { processMonthlyPayroll } from '@/app/actions/employees'
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
        findMany: vi.fn(),
        update: vi.fn(),
      },
      account: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      transaction: {
        create: vi.fn(),
      },
      goodsReceipt: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      purchaseOrder: {
        update: vi.fn(),
      },
      stockLevel: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      stockMovement: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      asset: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      assetDepreciation: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      payrollRecord: {
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

describe('ERP Enhancements Unit Tests', () => {
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
      enabledModules: ['INVENTORY', 'ASSETS', 'HR', 'FINANCE'],
    })

    // Mock $transaction to run callback immediately
    prisma.$transaction = vi.fn().mockImplementation(async (callback) => {
      return callback(prisma)
    })
  })

  describe('Goods Receipts Integration', () => {
    it('should create a Goods Receipt', async () => {
      const mockReceiptInput = {
        purchaseOrderId: 'po-123',
        warehouseId: 'wh-123',
        notes: 'Testing receipt creation',
        items: [
          { productId: 'prod-1', description: 'Item 1', orderedQty: 10, receivedQty: 10, acceptedQty: 9, rejectedQty: 1 }
        ]
      }

      vi.mocked(prisma.goodsReceipt.create).mockResolvedValueOnce({
        id: 'gr-123',
        receiptNumber: 'GR-000001',
        ...mockReceiptInput,
        items: mockReceiptInput.items.map(item => ({ ...item, orderedQty: new Decimal(item.orderedQty), receivedQty: new Decimal(item.receivedQty), acceptedQty: new Decimal(item.acceptedQty), rejectedQty: new Decimal(item.rejectedQty) }))
      } as any)

      const result = await createGoodsReceipt(mockReceiptInput)
      expect(result.id).toBe('gr-123')
      expect(prisma.goodsReceipt.create).toHaveBeenCalled()
    })

    it('should complete Goods Receipt, update stock levels, and mark PO as RECEIVED', async () => {
      const existingReceipt = {
        id: 'gr-123',
        receiptNumber: 'GR-000001',
        purchaseOrderId: 'po-123',
        warehouseId: 'wh-123',
        status: 'PENDING',
        items: [
          { productId: 'prod-1', description: 'Item 1', acceptedQty: new Decimal(5) }
        ]
      }

      vi.mocked(prisma.goodsReceipt.findFirst).mockResolvedValueOnce(existingReceipt as any)
      vi.mocked(prisma.stockMovement.findFirst).mockResolvedValueOnce({ movementNumber: 'SM-000010' } as any)
      vi.mocked(prisma.goodsReceipt.findUnique).mockResolvedValueOnce({ ...existingReceipt, status: 'COMPLETED' } as any)

      const result = await updateGoodsReceiptStatus('gr-123', 'COMPLETED')
      expect(result!.status).toBe('COMPLETED')

      // Verify stock level was updated
      expect(prisma.stockLevel.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          productId_warehouseId: {
            productId: 'prod-1',
            warehouseId: 'wh-123'
          }
        }
      }))

      // Verify PO status was updated to RECEIVED
      expect(prisma.purchaseOrder.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'po-123' },
        data: expect.objectContaining({ status: 'RECEIVED' })
      }))
    })
  })

  describe('Fixed Assets Ledger integration', () => {
    it('should calculate depreciation and post to General Ledger', async () => {
      const mockAsset = {
        id: 'asset-123',
        name: 'Office Laptops',
        assetNumber: 'AST-000001',
        purchasePrice: new Decimal(1200),
        salvageValue: new Decimal(0),
        usefulLifeMonths: 12,
        currentValue: new Decimal(1200)
      }

      vi.mocked(prisma.asset.findFirst).mockResolvedValueOnce(mockAsset as any)
      vi.mocked(prisma.assetDepreciation.findFirst).mockResolvedValueOnce(null)
      
      // Mock chart of accounts lookup (return existing accounts so they aren't created)
      vi.mocked(prisma.account.findFirst).mockResolvedValue({ id: 'acc-123' } as any)
      vi.mocked(prisma.account.findMany).mockResolvedValue([
        { id: 'acc-depr-expense', accountNumber: '6500' },
        { id: 'acc-accum-depr', accountNumber: '1800' }
      ] as any)

      vi.mocked(prisma.assetDepreciation.create).mockResolvedValueOnce({
        id: 'depr-123',
        depreciationAmount: new Decimal(100)
      } as any)

      const result = await calculateDepreciation('asset-123')
      expect(result.depreciationAmount.toString()).toBe('100')

      // Verify GL Transactions posted Debit to 6500 (Depr Expense) and Credit to 1800 (Accum Depr)
      expect(prisma.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: new Decimal(100),
          entries: {
            create: [
              { accountId: 'acc-depr-expense', debit: new Decimal(100), credit: 0, description: 'Depreciation Expense' },
              { accountId: 'acc-accum-depr', debit: 0, credit: new Decimal(100), description: 'Accumulated Depreciation' }
            ]
          }
        })
      }))
    })
  })

  describe('HR & Payroll processing engine', () => {
    it('should process monthly payroll, create records, and post to General Ledger', async () => {
      const mockEmployees = [
        { id: 'emp-1', firstName: 'John', lastName: 'Doe', salary: new Decimal(3000), status: 'ACTIVE' }
      ]

      vi.mocked(prisma.employee.findMany).mockResolvedValueOnce(mockEmployees as any)
      vi.mocked(prisma.payrollRecord.count).mockResolvedValueOnce(0)
      
      // Mock chart of accounts lookup for Wages (6010), Checking (1010), Tax Payable (2200)
      vi.mocked(prisma.account.findFirst).mockResolvedValue({ id: 'acc-generic' } as any)
      vi.mocked(prisma.account.findMany).mockResolvedValue([
        { id: 'acc-wages', accountNumber: '6010' },
        { id: 'acc-checking', accountNumber: '1010' },
        { id: 'acc-tax-payable', accountNumber: '2200' }
      ] as any)

      vi.mocked(prisma.payrollRecord.create).mockResolvedValueOnce({
        id: 'payrec-1',
        baseSalary: new Decimal(3000),
        deductions: new Decimal(600),
        netPay: new Decimal(2400)
      } as any)

      const result = await processMonthlyPayroll(2026, 7)
      expect(result.length).toBe(1)

      // Verify GL entries for Payroll (6010 debit 3000, 1010 credit 2400, 2200 credit 600)
      expect(prisma.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          totalAmount: new Decimal(3000),
          entries: {
            create: [
              { accountId: 'acc-wages', debit: new Decimal(3000), credit: 0, description: 'Wages & Salary Expense' },
              { accountId: 'acc-checking', debit: 0, credit: new Decimal(2400), description: 'Cash Outflow' },
              { accountId: 'acc-tax-payable', debit: 0, credit: new Decimal(600), description: 'Payroll Tax Withheld' }
            ]
          }
        })
      }))
    })
  })
})
