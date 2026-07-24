import { CountryConfig } from '@/lib/countries/types'

export const spainConfig: CountryConfig = {
  code: 'ES',
  name: 'Spain',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇪🇸',
  timezone: 'Europe/Madrid',
  tax: {
    name: 'IVA (Impuesto sobre el Valor Añadido)',
    defaultRate: 21,
    taxIdLabel: 'NIF / CIF Number',
    complianceProvider: 'TICKETBAI_SPAIN',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Bizum'],
    },
    cardGateways: ['Redsys', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'Transferencia Bancaria'],
  },
}
