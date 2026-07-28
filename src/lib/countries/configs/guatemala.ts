import { CountryConfig } from '@/lib/countries/types'

export const guatemalaConfig: CountryConfig = {
  code: 'GT',
  name: 'Guatemala',
  currency: 'GTQ',
  currencySymbol: 'Q',
  flag: '🇬🇹',
  timezone: 'America/Guatemala',
  tax: {
    name: 'IVA (Impuesto al Valor Agregado)',
    defaultRate: 12,
    taxIdLabel: 'NIT (Número de Identificación Tributaria)',
    complianceProvider: 'SAT_GUATEMALA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Fri', 'Tigo Money Guatemala'],
    },
    cardGateways: ['Visanet Guatemala', 'NeoNet', 'Stripe'],
    bankRails: ['Transferencia ACH 5B', 'BI en Línea Transfer'],
  },
}
