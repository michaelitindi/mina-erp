import { CountryConfig } from '@/lib/countries/types'

export const switzerlandConfig: CountryConfig = {
  code: 'CH',
  name: 'Switzerland',
  currency: 'CHF',
  currencySymbol: 'CHF',
  flag: '🇨🇭',
  timezone: 'Europe/Zurich',
  tax: {
    name: 'MWST / TVA / IVA',
    defaultRate: 8.1,
    taxIdLabel: 'UID (Unternehmens-ID)',
    complianceProvider: 'ESTAV_SWITZERLAND',
    requiresFiscalSignature: false,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Twint'],
    },
    cardGateways: ['SIX Payment Services', 'Datatrans', 'Stripe'],
    bankRails: ['Swiss QR-Bill Direct Transfer', 'PostFinance'],
  },
}
