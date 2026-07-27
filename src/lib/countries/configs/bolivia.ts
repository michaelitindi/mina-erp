import { CountryConfig } from '@/lib/countries/types'

export const boliviaConfig: CountryConfig = {
  code: 'BO',
  name: 'Bolivia',
  currency: 'BOB',
  currencySymbol: 'Bs.',
  flag: '🇧🇴',
  timezone: 'America/La_Paz',
  tax: {
    name: 'IVA (Impuesto al Valor Agregado)',
    defaultRate: 13,
    taxIdLabel: 'NIT (Número de Identificación Tributaria)',
    complianceProvider: 'SIN_BOLIVIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Tigo Money Bolivia', 'Soli Pagos'],
    },
    cardGateways: ['Red Enlace', 'ATC', 'Stripe'],
    bankRails: ['QR Simple Transfer', 'Transferencia Bancaria ACH'],
  },
}
