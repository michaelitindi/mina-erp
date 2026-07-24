import { CountryConfig } from '@/lib/countries/types'

export const ukConfig: CountryConfig = {
  code: 'GB',
  name: 'United Kingdom',
  currency: 'GBP',
  currencySymbol: '£',
  flag: '🇬🇧',
  timezone: 'Europe/London',
  tax: {
    name: 'HMRC VAT',
    defaultRate: 20,
    taxIdLabel: 'VAT Registration Number',
    complianceProvider: 'HMRC_MTD',
    requiresFiscalSignature: false,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['Stripe', 'Checkout.com'],
    bankRails: ['BACS Direct Debit', 'Faster Payments'],
  },
}
