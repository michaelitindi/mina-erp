import { CountryConfig } from '@/lib/countries/types'

export const paraguayConfig: CountryConfig = {
  code: 'PY',
  name: 'Paraguay',
  currency: 'PYG',
  currencySymbol: '₲',
  flag: '🇵🇾',
  timezone: 'America/Asuncion',
  tax: {
    name: 'IVA (Impuesto al Valor Agregado)',
    defaultRate: 10,
    taxIdLabel: 'RUC Number',
    complianceProvider: 'SIFEN_PARAGUAY',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Tigo Money', 'Personal Pay', 'Billetera Zimple'],
    },
    cardGateways: ['Bancard vPOS', 'Pago Express', 'Stripe'],
    bankRails: ['SIPAP Transferencia Directa', 'Infonet Pagos'],
  },
}
