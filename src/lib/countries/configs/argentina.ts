import { CountryConfig } from '@/lib/countries/types'

export const argentinaConfig: CountryConfig = {
  code: 'AR',
  name: 'Argentina',
  currency: 'ARS',
  currencySymbol: '$',
  flag: '🇦🇷',
  timezone: 'America/Argentina/Buenos_Aires',
  tax: {
    name: 'IVA (Impuesto al Valor Agregado)',
    defaultRate: 21,
    taxIdLabel: 'CUIT Number',
    complianceProvider: 'AFIP_ARGENTINA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Mercado Pago', 'Ualá', 'MODO'],
    },
    cardGateways: ['Naranja X', 'Mercado Pago', 'Stripe'],
    bankRails: ['DEBIN Directo', 'Transferencias 3.0 CBU/CVU'],
  },
}
