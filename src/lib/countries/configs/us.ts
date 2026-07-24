import { CountryConfig } from '@/lib/countries/types'

export const usConfig: CountryConfig = {
  code: 'US',
  name: 'United States',
  currency: 'USD',
  currencySymbol: '$',
  flag: '🇺🇸',
  timezone: 'America/New_York',
  tax: {
    name: 'State Sales Tax',
    defaultRate: 8.25,
    taxIdLabel: 'EIN / SSN',
    complianceProvider: 'AVALARA',
    requiresFiscalSignature: false,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['Stripe', 'Square', 'PayPal'],
    bankRails: ['Plaid / ACH Transfer', 'FedWire'],
  },
}
