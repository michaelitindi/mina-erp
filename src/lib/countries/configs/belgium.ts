import { CountryConfig } from '@/lib/countries/types'

export const belgiumConfig: CountryConfig = {
  code: 'BE',
  name: 'Belgium',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇧🇪',
  timezone: 'Europe/Brussels',
  tax: {
    name: 'BTW / TVA (Belasting over de Toegevoegde Waarde)',
    defaultRate: 21,
    taxIdLabel: 'BTW-nummer / N° TVA',
    complianceProvider: 'FPS_BELGIUM',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Bancontact Mobile', 'Payconiq'],
    },
    cardGateways: ['Bancontact', 'Mollie', 'Stripe', 'Worldline'],
    bankRails: ['SEPA Direct Debit', 'KBC / CBC Online Transfer'],
  },
}
