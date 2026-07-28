import { CountryConfig } from '@/lib/countries/types'

export const irelandConfig: CountryConfig = {
  code: 'IE',
  name: 'Ireland',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇮🇪',
  timezone: 'Europe/Dublin',
  tax: {
    name: 'VAT (Value Added Tax)',
    defaultRate: 23,
    taxIdLabel: 'Tax Reference Number (TRN)',
    complianceProvider: 'ROS_IRELAND',
    requiresFiscalSignature: false,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Revolut Pay'],
    },
    cardGateways: ['Stripe', 'Elavon', 'Realex / Global Payments'],
    bankRails: ['SEPA Direct Debit', 'EFT Direct Bank Transfer'],
  },
}
