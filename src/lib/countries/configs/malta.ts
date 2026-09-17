import { CountryConfig } from '@/lib/countries/types'

export const maltaConfig: CountryConfig = {
  code: 'MT',
  name: 'Malta',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇲🇹',
  timezone: 'Europe/Malta',
  tax: {
    name: 'VAT (Value Added Tax)',
    defaultRate: 18,
    taxIdLabel: 'TIN / VAT Registration Number',
    complianceProvider: 'CFR_MALTA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['BOV Mobile', 'Revolut Pay Malta'],
    },
    cardGateways: ['APCO Pay', 'Truevo', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'BOV / HSBC Direct Bank Transfer'],
  },
}
