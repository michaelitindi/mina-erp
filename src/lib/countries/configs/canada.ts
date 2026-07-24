import { CountryConfig } from '@/lib/countries/types'

export const canadaConfig: CountryConfig = {
  code: 'CA',
  name: 'Canada',
  currency: 'CAD',
  currencySymbol: '$',
  flag: '🇨🇦',
  timezone: 'America/Toronto',
  tax: {
    name: 'GST / HST',
    defaultRate: 13,
    taxIdLabel: 'CRA Business Number',
    complianceProvider: 'AVALARA',
    requiresFiscalSignature: false,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['Stripe', 'Moneris', 'Helcim'],
    bankRails: ['Interac e-Transfer', 'EFT Direct Deposit'],
  },
}
