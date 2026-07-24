import { CountryConfig } from '@/lib/countries/types'

export const uaeConfig: CountryConfig = {
  code: 'AE',
  name: 'United Arab Emirates',
  currency: 'AED',
  currencySymbol: 'AED',
  flag: '🇦🇪',
  timezone: 'Asia/Dubai',
  tax: {
    name: 'FTA VAT',
    defaultRate: 5,
    taxIdLabel: 'Tax Registration Number (TRN)',
    complianceProvider: 'FTA_ZATCA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['Telr', 'CCAvenue', 'Stripe'],
    bankRails: ['UAE FTS Direct Transfer'],
  },
}
