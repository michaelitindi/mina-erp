import type { CountryConfig } from '@/lib/countries/types'

export const southAfricaConfig: CountryConfig = {
  code: 'ZA',
  name: 'South Africa',
  currency: 'ZAR',
  currencySymbol: 'R',
  flag: '🇿🇦',
  timezone: 'Africa/Johannesburg',
  tax: {
    name: 'SARS VAT',
    defaultRate: 15,
    taxIdLabel: 'Tax Reference Number',
    complianceProvider: 'SARS_VAT',
    requiresFiscalSignature: false,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['PayFast', 'Peach Payments', 'Stripe'],
    bankRails: ['Ozow Instant EFT', 'Capitec Pay'],
  },
}
