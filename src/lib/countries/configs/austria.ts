import { CountryConfig } from '@/lib/countries/types'

export const austriaConfig: CountryConfig = {
  code: 'AT',
  name: 'Austria',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇦🇹',
  timezone: 'Europe/Vienna',
  tax: {
    name: 'MwSt (Mehrwertsteuer)',
    defaultRate: 20,
    taxIdLabel: 'UID-Nummer (Umsatzsteuer-Identifikationsnummer)',
    complianceProvider: 'FINANZONLINE_AUSTRIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['EPS Online Überweisung'],
    },
    cardGateways: ['Stripe', 'Klarna', 'Unzer / Payolution'],
    bankRails: ['SEPA Direct Debit', 'EPS Direct Bank Transfer'],
  },
}
