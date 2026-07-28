import { CountryConfig } from '@/lib/countries/types'

export const panamaConfig: CountryConfig = {
  code: 'PA',
  name: 'Panama',
  currency: 'USD',
  currencySymbol: '$',
  flag: '🇵🇦',
  timezone: 'America/Panama',
  tax: {
    name: 'ITBMS (Impuesto de Transferencia de Bienes Muebles y Servicios)',
    defaultRate: 7,
    taxIdLabel: 'RUC / DV Number',
    complianceProvider: 'DGI_PANAMA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Yappi', 'Nequi Panama'],
    },
    cardGateways: ['Punto Pago', 'Credicorp Bank', 'Stripe'],
    bankRails: ['ACH Xpress Direct Transfer', 'Transferencia Banco General'],
  },
}
