/**
 * Cash Payment Provider
 * 
 * Simple provider for cash payments (POS only).
 * No API calls needed - just records the transaction.
 */

import type { 
  PaymentProviderInterface, 
  PaymentResult, 
  RefundResult, 
  WebhookResult 
} from '../interface'

export class CashProvider implements PaymentProviderInterface {
  id = 'CASH'
  name = 'Cash'

  async processPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    // Cash payments are always successful (handled offline)
    return {
      success: true,
      transactionId: `CASH-${Date.now()}`,
      metadata: {
        amount,
        currency,
        method: 'cash',
        ...metadata,
      },
    }
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    // Cash refunds are manual
    return {
      success: true,
      refundId: `CASH-REFUND-${Date.now()}`,
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
    // Cash has no webhooks
    return {
      verified: false,
      error: 'Cash payments do not support webhooks',
    }
  }
}
