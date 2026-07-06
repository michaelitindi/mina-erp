import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initMpesaPayment } from '@/lib/payment'
import { POST } from '@/app/api/webhooks/mpesa/route'
import { reconcilePaymentWebhook } from '@/app/actions/payments'
import { initiateStkPush } from '@/lib/payments/mpesa'

vi.mock('@/lib/payments/mpesa', () => ({
  initiateStkPush: vi.fn(),
}))

vi.mock('@/app/actions/payments', () => ({
  reconcilePaymentWebhook: vi.fn(() => Promise.resolve({ success: true, message: 'Reconciled' })),
}))

describe('M-Pesa Daraja Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initMpesaPayment', () => {
    it('should successfully initiate STK push when phone is provided', async () => {
      vi.mocked(initiateStkPush).mockResolvedValue({
        success: true,
        checkoutRequestId: 'ws_CO_05072026_12345'
      })

      const config = {
        provider: 'MPESA' as const,
        config: {
          consumerKey: 'test_key',
          consumerSecret: 'test_secret',
          shortcode: '174379',
          passkey: 'test_passkey',
          isSandbox: 'true'
        }
      }

      const params = {
        orderId: 'order-999',
        orderNumber: 'ORD-999',
        amount: 1500, // 15 KES
        currency: 'KES',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        customerPhone: '254712345678',
        callbackUrl: 'http://localhost/callback'
      }

      const result = await initMpesaPayment(config, params)
      expect(result.success).toBe(true)
      expect(result.paymentReference).toBe('ws_CO_05072026_12345')
      expect(initiateStkPush).toHaveBeenCalledWith(expect.objectContaining({
        amount: 15,
        phoneNumber: '254712345678',
        reference: 'ORD-999',
        shortcode: '174379',
      }))
    })

    it('should fail if phone number is missing', async () => {
      const config = {
        provider: 'MPESA' as const,
        config: {}
      }

      const params = {
        orderId: 'order-999',
        orderNumber: 'ORD-999',
        amount: 1500,
        currency: 'KES',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        callbackUrl: 'http://localhost/callback'
      }

      const result = await initMpesaPayment(config, params)
      expect(result.success).toBe(false)
      expect(result.error).toContain('requires a customer phone number')
    })
  })

  describe('M-Pesa Webhook', () => {
    it('should parse STK push callback and invoke reconcilePaymentWebhook', async () => {
      const reqBody = {
        Body: {
          stkCallback: {
            MerchantRequestID: "12345-67890",
            CheckoutRequestID: "ws_CO_05072026_12345",
            ResultCode: 0,
            ResultDesc: "The service request is processed successfully.",
            CallbackMetadata: {
              Item: [
                { Name: "Amount", Value: 15.00 },
                { Name: "MpesaReceiptNumber", Value: "QWERTYUIOP" },
                { Name: "TransactionDate", Value: 20260705094335 },
                { Name: "PhoneNumber", Value: 254712345678 }
              ]
            }
          }
        }
      }

      const request = new Request('http://localhost/api/webhooks/mpesa?orderId=order-999&type=ORDER', {
        method: 'POST',
        body: JSON.stringify(reqBody)
      })

      const response = await POST(request)
      const resData = await response.json()

      expect(response.status).toBe(200)
      expect(resData.ResultCode).toBe(0)
      expect(reconcilePaymentWebhook).toHaveBeenCalledWith({
        amount: 15.00,
        reference: 'QWERTYUIOP',
        provider: 'M-Pesa STK Push',
        metadata: {
          type: 'ORDER',
          orderId: 'order-999'
        }
      })
    })

    it('should parse C2B confirmation callback and invoke reconcilePaymentWebhook', async () => {
      const reqBody = {
        TransactionType: "Pay Bill",
        TransID: "RSTUVWXYZ1",
        TransTime: "20260705094335",
        TransAmount: "250.00",
        BusinessShortCode: "600638",
        BillRefNumber: "INV-2026-0099",
        MSISDN: "254712345678",
        FirstName: "John"
      }

      const request = new Request('http://localhost/api/webhooks/mpesa', {
        method: 'POST',
        body: JSON.stringify(reqBody)
      })

      const response = await POST(request)
      const resData = await response.json()

      expect(response.status).toBe(200)
      expect(resData.ResultCode).toBe(0)
      expect(reconcilePaymentWebhook).toHaveBeenCalledWith({
        amount: 250,
        reference: 'RSTUVWXYZ1',
        provider: 'M-Pesa C2B',
        metadata: {
          invoiceId: 'INV-2026-0099',
          orderId: 'INV-2026-0099',
          type: 'INVOICE'
        }
      })
    })
  })
})
