import { CountryConfig } from '@/lib/countries/types'

export const netherlandsConfig: CountryConfig = {
  code: 'NL',
  name: 'Netherlands',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇳🇱',
  timezone: 'Europe/Amsterdam',
  tax: {
    name: 'BTW (Omzetbelasting)',
    defaultRate: 21,
    taxIdLabel: 'BTW-identificatienummer',
    complianceProvider: 'DIGIPOORT_NL',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['iDEAL Mobile Payment'],
    },
    cardGateways: ['Mollie', 'Stripe', 'Adyen'],
    bankRails: ['iDEAL Direct Transfer', 'SEPA Direct Debit'],
  },
}
