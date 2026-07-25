import { CountryConfig } from '@/lib/countries/types'

export const philippinesConfig: CountryConfig = {
  code: 'PH',
  name: 'Philippines',
  currency: 'PHP',
  currencySymbol: '₱',
  flag: '🇵🇭',
  timezone: 'Asia/Manila',
  tax: {
    name: 'VAT (Value Added Tax)',
    defaultRate: 12,
    taxIdLabel: 'Tax Identification Number (TIN)',
    complianceProvider: 'BIR_PHILIPPINES',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['GCash', 'Maya', 'Coins.ph'],
    },
    cardGateways: ['PayMongo', 'Dragonpay', 'Xendit PH', 'Stripe'],
    bankRails: ['InstaPay Instant Transfer', 'PESONet Batch Direct Transfer'],
  },
}
