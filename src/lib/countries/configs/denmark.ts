import { CountryConfig } from '@/lib/countries/types'

export const denmarkConfig: CountryConfig = {
  code: 'DK',
  name: 'Denmark',
  currency: 'DKK',
  currencySymbol: 'kr.',
  flag: '🇩🇰',
  timezone: 'Europe/Copenhagen',
  tax: {
    name: 'MOMS (Merværdiafgift)',
    defaultRate: 25,
    taxIdLabel: 'CVR-nummer',
    complianceProvider: 'NEMHANDEL_DENMARK',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['MobilePay'],
    },
    cardGateways: ['Dankort', 'Stripe', 'Klarna', 'Nets'],
    bankRails: ['Betalingsservice Direct Debit', 'FIK Bank Transfer'],
  },
}
