import { CountryConfig } from '@/lib/countries/types'

export const peruConfig: CountryConfig = {
  code: 'PE',
  name: 'Peru',
  currency: 'PEN',
  currencySymbol: 'S/',
  flag: '🇵🇪',
  timezone: 'America/Lima',
  tax: {
    name: 'IGV (Impuesto General a las Ventas)',
    defaultRate: 18,
    taxIdLabel: 'RUC (Registro Único de Contribuyentes)',
    complianceProvider: 'SUNAT_PERU',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Yape', 'Plin', 'BIM'],
    },
    cardGateways: ['Culqi', 'Izipay', 'Niubiz', 'Stripe'],
    bankRails: ['PagoEfectivo', 'Transferencia Interbancaria CCI'],
  },
}
