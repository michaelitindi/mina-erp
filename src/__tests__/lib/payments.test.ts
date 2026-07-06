import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reconcilePaymentWebhook } from '@/app/actions/payments'
import { prisma } from '@/lib/prisma'
import { postToLedger } from '@/lib/finance'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    onlineOrder: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  }
}))

vi.mock('@/lib/finance', () => ({
  postToLedger: vi.fn(() => Promise.resolve()),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Payments Reconciliation plumbing tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should auto-reconcile invoices and post to general ledger', async () => {
    const mockInvoice = {
      id: 'inv-123',
      organizationId: 'org-123',
      invoiceNumber: 'INV-0001',
      totalAmount: 100,
      paidAmount: 0,
      status: 'SENT',
      createdBy: 'user-123',
      customer: { companyName: 'Acme Corp' }
    }
    vi.mocked(prisma.invoice.findUnique).mockResolvedValue(mockInvoice as any)
    vi.mocked(prisma.payment.findFirst).mockResolvedValue(null)

    const payload = {
      amount: 100,
      reference: 'ch_stripe_123',
      provider: 'Stripe',
      metadata: { invoiceId: 'inv-123', type: 'INVOICE' }
    }

    const result = await reconcilePaymentWebhook(payload)
    expect(result.success).toBe(true)

    expect(prisma.payment.create).toHaveBeenCalled()
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv-123' },
      data: expect.objectContaining({
        status: 'PAID'
      })
    })

    expect(postToLedger).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      organizationId: 'org-123',
      entries: [
        { accountNumber: '1010', debit: 100, description: 'Stripe checking receipt' },
        { accountNumber: '1100', credit: 100, description: 'Accounts Receivable' }
      ]
    }))
  })

  it('should auto-reconcile e-commerce storefront orders and post to general ledger', async () => {
    const mockOrder = {
      id: 'order-123',
      orderNumber: 'ORD-5555',
      totalAmount: 49.99,
      paymentStatus: 'PENDING',
      customerName: 'Alice',
      store: { organizationId: 'org-123' }
    }
    vi.mocked(prisma.onlineOrder.findFirst).mockResolvedValue(mockOrder as any)

    const payload = {
      amount: 49.99,
      reference: 'ch_paystack_888',
      provider: 'Paystack',
      metadata: { orderId: 'order-123', type: 'ORDER' }
    }

    const result = await reconcilePaymentWebhook(payload)
    expect(result.success).toBe(true)

    expect(prisma.onlineOrder.update).toHaveBeenCalledWith({
      where: { id: 'order-123' },
      data: expect.objectContaining({
        paymentStatus: 'PAID'
      })
    })

    expect(postToLedger).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      organizationId: 'org-123',
      entries: [
        { accountNumber: '1010', debit: 49.99, description: 'Paystack checking receipt' },
        { accountNumber: '4000', credit: 49.99, description: 'E-commerce Sales Revenue' }
      ]
    }))
  })
})
