import { CountryConfig } from '@/lib/countries/types'

export const estoniaConfig: CountryConfig = {
  code: 'EE',
  name: 'Estonia',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇪🇪',
  timezone: 'Europe/Tallinn',
  tax: {
    name: 'KM (Käibemaks)',
    defaultRate: 22,
    taxIdLabel: 'KMKR number',
    complianceProvider: 'EMTA_ESTONIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Montonio Mobile', 'Pocopay'],
    },
    cardGateways: ['Montonio', 'EveryPay', 'Maksekeskus', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'Estonian Banklink'],
  },
}
