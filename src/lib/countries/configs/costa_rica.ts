import { CountryConfig } from '@/lib/countries/types'

export const costaRicaConfig: CountryConfig = {
  code: 'CR',
  name: 'Costa Rica',
  currency: 'CRC',
  currencySymbol: '₡',
  flag: '🇨🇷',
  timezone: 'America/Costa_Rica',
  tax: {
    name: 'IVA (Impuesto sobre el Valor Agregado)',
    defaultRate: 13,
    taxIdLabel: 'Cédula Jurídica / NITE',
    complianceProvider: 'HACIENDA_CR',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['SINPE Móvil'],
    },
    cardGateways: ['BAC Credomatic', 'Kushki CR', 'Stripe'],
    bankRails: ['SINPE Transferencia Interbancaria', 'Transferencia Banco Nacional'],
  },
}
