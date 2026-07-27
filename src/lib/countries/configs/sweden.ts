import { CountryConfig } from '@/lib/countries/types'

export const swedenConfig: CountryConfig = {
  code: 'SE',
  name: 'Sweden',
  currency: 'SEK',
  currencySymbol: 'kr',
  flag: '🇸🇪',
  timezone: 'Europe/Stockholm',
  tax: {
    name: 'Moms (Mervärdesskatt)',
    defaultRate: 25,
    taxIdLabel: 'Organisationsnummer / Momsnr',
    complianceProvider: 'DIGG_SWEDEN',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Swish'],
    },
    cardGateways: ['Klarna', 'Stripe', 'Bambora'],
    bankRails: ['Autogiro Direct Debit', 'Bankgirot Transfer'],
  },
}
