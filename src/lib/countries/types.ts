/**
 * Universal Country Financial & Payment Localization Interfaces
 */

export interface TaxConfig {
  name: string                  // e.g. 'VAT / eTIMS', 'State Sales Tax', 'HMRC VAT'
  defaultRate: number           // e.g. 16, 8.25, 20
  taxIdLabel: string            // e.g. 'KRA PIN Number', 'EIN / SSN', 'VAT Registration Number'
  complianceProvider: 'KRA_ETIMS' | 'AVALARA' | 'HMRC_MTD' | 'SARS_VAT' | 'FTA_ZATCA' | 'STANDARD'
  requiresFiscalSignature: boolean
}

export interface PaymentRailConfig {
  mobileMoney: {
    enabled: boolean
    providers: string[]         // e.g. ['M-Pesa Express', 'Airtel Money']
  }
  cardGateways: string[]         // e.g. ['Stripe', 'Paystack', 'Flutterwave']
  bankRails: string[]            // e.g. ['Plaid / ACH', 'BACS Direct Debit', 'Ozow EFT']
}

export interface CountryConfig {
  code: string                  // ISO 2-letter country code (e.g. 'KE', 'US', 'GB')
  name: string                  // e.g. 'Kenya', 'United States'
  currency: string              // e.g. 'KES', 'USD', 'GBP'
  currencySymbol: string        // e.g. 'KSh', '$', '£'
  flag: string                  // Emoji flag
  timezone: string
  tax: TaxConfig
  payments: PaymentRailConfig
}
