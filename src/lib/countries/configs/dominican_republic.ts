import { CountryConfig } from '@/lib/countries/types'

export const dominicanRepublicConfig: CountryConfig = {
  code: 'DO',
  name: 'Dominican Republic',
  currency: 'DOP',
  currencySymbol: 'RD$',
  flag: '🇩🇴',
  timezone: 'America/Santo_Domingo',
  tax: {
    name: 'ITBIS (Impuesto sobre Transferencias de Bienes)',
    defaultRate: 18,
    taxIdLabel: 'RNC (Registro Nacional del Contribuyente)',
    complianceProvider: 'DGII_DOMINICAN',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['tPago', 'Moncash'],
    },
    cardGateways: ['Azul (Banco Popular)', 'CardNET', 'Placetopay', 'Stripe'],
    bankRails: ['ACH Transferencia Interbancaria', 'Banco BHD Direct'],
  },
}
