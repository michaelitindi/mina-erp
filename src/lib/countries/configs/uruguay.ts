import { CountryConfig } from '@/lib/countries/types'

export const uruguayConfig: CountryConfig = {
  code: 'UY',
  name: 'Uruguay',
  currency: 'UYU',
  currencySymbol: '$',
  flag: '🇺🇾',
  timezone: 'America/Montevideo',
  tax: {
    name: 'IVA (Impuesto al Valor Agregado)',
    defaultRate: 22,
    taxIdLabel: 'RUT (Registro Único Tributario)',
    complianceProvider: 'CFE_URUGUAY',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Prex', 'OCA Blue'],
    },
    cardGateways: ['OCA', 'Mercado Pago', 'Stripe'],
    bankRails: ['Banred Transferencia Directa', 'Redpagos'],
  },
}
