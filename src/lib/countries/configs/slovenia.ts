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
    taxIdLabel: 'ID za DDV (Tax ID)',
    complianceProvider: 'FURS_SLOVENIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Flik Instant Payment'],
    },
    cardGateways: ['Bankart', 'Halcom', 'Stripe', 'NLB Klik'],
    bankRails: ['SEPA Direct Debit', 'Halcom E-bank Transfer'],
  },
}
