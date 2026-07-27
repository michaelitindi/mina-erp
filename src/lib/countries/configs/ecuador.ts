import { CountryConfig } from '@/lib/countries/types'

export const ecuadorConfig: CountryConfig = {
  code: 'EC',
  name: 'Ecuador',
  currency: 'USD',
  currencySymbol: '$',
  flag: '🇪🇨',
  timezone: 'America/Guayaquil',
  tax: {
    name: 'IVA (Impuesto al Valor Agregado)',
    defaultRate: 15,
    taxIdLabel: 'RUC Number',
    complianceProvider: 'SRI_ECUADOR',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Deuna!', 'Billetera Pichincha'],
    },
    cardGateways: ['Payphone', 'Kushki', 'Placetopay', 'Stripe'],
    bankRails: ['Transferencia Directa Banco Pichincha', 'PayClub'],
  },
}
