import { CountryConfig } from '@/lib/countries/types'

export const mexicoConfig: CountryConfig = {
  code: 'MX',
  name: 'Mexico',
  currency: 'MXN',
  currencySymbol: '$',
  flag: '🇲🇽',
  timezone: 'America/Mexico_City',
  tax: {
    name: 'IVA (Value Added Tax)',
    defaultRate: 16,
    taxIdLabel: 'RFC Tax ID',
    complianceProvider: 'CFDI_MEXICO',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['Conekta', 'Stripe', 'Mercado Pago'],
    bankRails: ['SPEI Instant Bank Transfer', 'OXXO Cash Pay'],
  },
}
