import { CountryConfig } from '@/lib/countries/types'

export const germanyConfig: CountryConfig = {
  code: 'DE',
  name: 'Germany',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇩🇪',
  timezone: 'Europe/Berlin',
  tax: {
    name: 'MwSt (VAT)',
    defaultRate: 19,
    taxIdLabel: 'USt-IdNr (VAT ID)',
    complianceProvider: 'SEPA_EU',
    requiresFiscalSignature: false,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['Stripe', 'Unzer'],
    bankRails: ['SEPA Direct Debit', 'SOFORT / Klarna', 'Giropay'],
  },
}
