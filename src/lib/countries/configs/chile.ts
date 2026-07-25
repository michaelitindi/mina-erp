import { CountryConfig } from '@/lib/countries/types'

export const chileConfig: CountryConfig = {
  code: 'CL',
  name: 'Chile',
  currency: 'CLP',
  currencySymbol: '$',
  flag: '🇨🇱',
  timezone: 'America/Santiago',
  tax: {
    name: 'IVA (Impuesto a las Ventas y Servicios)',
    defaultRate: 19,
    taxIdLabel: 'RUT (Rol Único Tributario)',
    complianceProvider: 'SII_CHILE',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Fpay', 'Mach'],
    },
    cardGateways: ['Webpay Plus (Transbank)', 'Khipu', 'Flow', 'Stripe'],
    bankRails: ['TEF Transferencia Electrónica', 'Servipag'],
  },
}
