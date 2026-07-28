import { CountryConfig } from '@/lib/countries/types'

export const portugalConfig: CountryConfig = {
  code: 'PT',
  name: 'Portugal',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇵🇹',
  timezone: 'Europe/Lisbon',
  tax: {
    name: 'IVA (Imposto sobre o Valor Acrescentado)',
    defaultRate: 23,
    taxIdLabel: 'NIF (Número de Identificação Fiscal)',
    complianceProvider: 'AT_PORTUGAL',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['MB WAY'],
    },
    cardGateways: ['Multibanco', 'Stripe', 'SIBS'],
    bankRails: ['Multibanco Reference Transfer', 'SEPA Direct Debit'],
  },
}
