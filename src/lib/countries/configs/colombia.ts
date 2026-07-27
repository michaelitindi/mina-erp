import { CountryConfig } from '@/lib/countries/types'

export const colombiaConfig: CountryConfig = {
  code: 'CO',
  name: 'Colombia',
  currency: 'COP',
  currencySymbol: '$',
  flag: '🇨🇴',
  timezone: 'America/Bogota',
  tax: {
    name: 'IVA (Impuesto al Valor Agregado)',
    defaultRate: 19,
    taxIdLabel: 'NIT (Número de Identificación Tributaria)',
    complianceProvider: 'DIAN_COLOMBIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Nequi', 'Daviplata'],
    },
    cardGateways: ['PayU Colombia', 'Bold', 'Stripe'],
    bankRails: ['PSE Pagos Seguros en Línea', 'Bancolombia Transfer'],
  },
}
