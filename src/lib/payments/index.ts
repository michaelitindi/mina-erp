/**
 * Payment Provider Factory
 * 
 * Creates the appropriate payment provider instance based on type and config.
 */

import type { PaymentProviderInterface, ProviderConfig, ProviderType } from './interface'
import { CashProvider } from './providers/cash'
import { StripeProvider } from './providers/stripe'

/**
 * Get a payment provider instance by type
 */
export function getPaymentProvider(
  type: ProviderType,
  config: ProviderConfig
): PaymentProviderInterface {
  switch (type) {
    case 'CASH':
      return new CashProvider()
    case 'STRIPE':
      return new StripeProvider(config)
    // Add more providers as implemented:
    // case 'PAYPAL':
    //   return new PayPalProvider(config)
    // case 'MPESA':
    //   return new MpesaProvider(config)
    default:
      throw new Error(`Payment provider ${type} is not yet implemented`)
  }
}

/**
 * Get all available provider types with metadata
 */
export function getAvailableProviders() {
  return [
    { type: 'STRIPE', name: 'Stripe', description: 'Credit/Debit Cards', forPOS: true, forEcommerce: true },
    { type: 'PAYPAL', name: 'PayPal', description: 'PayPal Account', forPOS: false, forEcommerce: true },
    { type: 'LEMONSQUEEZY', name: 'LemonSqueezy', description: 'Subscriptions & SaaS', forPOS: false, forEcommerce: true },
    { type: 'RAZORPAY', name: 'Razorpay', description: 'UPI, Cards (India)', forPOS: true, forEcommerce: true },
    { type: 'GPAY', name: 'Google Pay', description: 'Google Wallet', forPOS: true, forEcommerce: true },
    { type: 'MPESA', name: 'M-Pesa', description: 'Mobile Money (Kenya)', forPOS: true, forEcommerce: true },
    { type: 'FLUTTERWAVE', name: 'Flutterwave', description: 'Africa-wide Payments', forPOS: true, forEcommerce: true },
    { type: 'INTASEND', name: 'IntaSend', description: 'M-Pesa + Cards (Kenya)', forPOS: true, forEcommerce: true },
    { type: 'CASH', name: 'Cash', description: 'Manual Cash Payment', forPOS: true, forEcommerce: false },
  ]
}
