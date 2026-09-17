import { CountryConfig } from '@/lib/countries/types'

export const sloveniaConfig: CountryConfig = {
  code: 'SI',
  name: 'Slovenia',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇸🇮',
  timezone: 'Europe/Ljubljana',
  tax: {
    name: 'DDV (Davek na dodano vrednost)',
    defaultRate: 22,
    taxIdLabel: 'ID za DDV / Davčna številka',
    complianceProvider: 'FURS_SLOVENIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Flik Instant Payments', 'mBills'],
    },
    cardGateways: ['Bankart', 'Stripe', 'Halcom Pay'],
    bankRails: ['SEPA Direct Debit', 'UPN QR Direct Transfer'],
  },
}
