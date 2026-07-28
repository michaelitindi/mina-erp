import { CountryConfig } from '@/lib/countries/types'

export const luxembourgConfig: CountryConfig = {
  code: 'LU',
  name: 'Luxembourg',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇱🇺',
  timezone: 'Europe/Luxembourg',
  tax: {
    name: 'TVA (Taxe sur la Valeur Ajoutée)',
    defaultRate: 17,
    taxIdLabel: 'N° TVA / Matricule',
    complianceProvider: 'ACD_LUXEMBOURG',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Digicash', 'Payconiq Luxembourg'],
    },
    cardGateways: ['Worldline LU', 'Mollie', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'Multiline Direct Transfer'],
  },
}
