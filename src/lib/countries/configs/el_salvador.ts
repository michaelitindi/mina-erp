import { CountryConfig } from '@/lib/countries/types'

export const elSalvadorConfig: CountryConfig = {
  code: 'SV',
  name: 'El Salvador',
  currency: 'USD',
  currencySymbol: '$',
  flag: '🇸🇻',
  timezone: 'America/El_Salvador',
  tax: {
    name: 'IVA (Impuesto al Valor Agregado)',
    defaultRate: 13,
    taxIdLabel: 'NIT / NRC Number',
    complianceProvider: 'MH_ELSALVADOR',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Chivo Wallet', 'Tigo Money El Salvador'],
    },
    cardGateways: ['Wompi SV', 'Pagadito', 'Stripe'],
    bankRails: ['Transferencia UniDirecta ACH', 'Banco Agricola Direct'],
  },
}
