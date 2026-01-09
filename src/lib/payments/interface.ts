/**
 * Payment Provider Interface
 * 
 * All payment providers must implement this interface for consistent
 * integration across POS and E-commerce modules.
 */

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  metadata?: Record<string, any>
}

export interface RefundResult {
  success: boolean
  refundId?: string
  error?: string
}

export interface WebhookResult {
  verified: boolean
  eventType?: string
  data?: any
  error?: string
}

export interface CheckoutSession {
  url: string
  sessionId: string
}

export interface PaymentProviderInterface {
  /** Provider identifier */
  id: string
  
  /** Display name */
  name: string
  
  /** 
   * Process a payment
   * For cash: just record the transaction
   * For card/mobile: call provider API
   */
  processPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult>
  
  /**
   * Refund a payment (partial or full)
   */
  refund(
    transactionId: string,
    amount?: number
  ): Promise<RefundResult>
  
  /**
   * Handle webhook from provider
   */
  handleWebhook(
    payload: any,
    signature: string
  ): Promise<WebhookResult>
  
  /**
   * Get a hosted checkout URL (for providers that support it)
   * Returns null if provider doesn't support hosted checkout
   */
  getCheckoutUrl?(
    amount: number,
    currency: string,
    returnUrl: string,
    metadata?: Record<string, any>
  ): Promise<CheckoutSession | null>
}

/**
 * Provider types supported by the system
 */
export type ProviderType = 
  | 'STRIPE'
  | 'PAYPAL'
  | 'LEMONSQUEEZY'
  | 'RAZORPAY'
  | 'GPAY'
  | 'MPESA'
  | 'FLUTTERWAVE'
  | 'INTASEND'
  | 'CASH'

/**
 * Provider configuration stored in database
 */
export interface ProviderConfig {
  apiKey?: string
  secretKey?: string
  webhookSecret?: string
  sandboxMode?: boolean
  [key: string]: any
}
