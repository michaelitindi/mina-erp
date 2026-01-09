/**
 * Stripe Payment Provider
 * 
 * Handles card payments via Stripe for both POS and E-commerce.
 */

import type { 
  PaymentProviderInterface, 
  PaymentResult, 
  RefundResult, 
  WebhookResult,
  CheckoutSession,
  ProviderConfig 
} from '../interface'

export class StripeProvider implements PaymentProviderInterface {
  id = 'STRIPE'
  name = 'Stripe'
  private config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
  }

  async processPayment(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    try {
      // Dynamic import to avoid bundling Stripe in client
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(this.config.secretKey || '', {
        apiVersion: '2025-12-15.clover',
      })

      // Create a PaymentIntent for direct charges
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: metadata as Record<string, string>,
      })

      return {
        success: true,
        transactionId: paymentIntent.id,
        metadata: {
          clientSecret: paymentIntent.client_secret,
          status: paymentIntent.status,
        },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Stripe payment failed',
      }
    }
  }

  async refund(transactionId: string, amount?: number): Promise<RefundResult> {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(this.config.secretKey || '', {
        apiVersion: '2025-12-15.clover',
      })

      const refund = await stripe.refunds.create({
        payment_intent: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
      })

      return {
        success: true,
        refundId: refund.id,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Stripe refund failed',
      }
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<WebhookResult> {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(this.config.secretKey || '', {
        apiVersion: '2025-12-15.clover',
      })

      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret || ''
      )

      return {
        verified: true,
        eventType: event.type,
        data: event.data.object,
      }
    } catch (error: any) {
      return {
        verified: false,
        error: error.message || 'Webhook verification failed',
      }
    }
  }

  async getCheckoutUrl(
    amount: number,
    currency: string,
    returnUrl: string,
    metadata?: Record<string, any>
  ): Promise<CheckoutSession | null> {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(this.config.secretKey || '', {
        apiVersion: '2025-12-15.clover',
      })

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(amount * 100),
            product_data: { name: 'Purchase' },
          },
          quantity: 1,
        }],
        success_url: `${returnUrl}?success=true`,
        cancel_url: `${returnUrl}?canceled=true`,
        metadata: metadata as Record<string, string>,
      })

      return {
        url: session.url || '',
        sessionId: session.id,
      }
    } catch (error: any) {
      return null
    }
  }
}
