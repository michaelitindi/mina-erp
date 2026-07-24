import { CountryConfig } from '@/lib/countries/types'

export const japanConfig: CountryConfig = {
  code: 'JP',
  name: 'Japan',
  currency: 'JPY',
  currencySymbol: '¥',
  flag: '🇯🇵',
  timezone: 'Asia/Tokyo',
  tax: {
    name: 'Consumption Tax (Shouhizei)',
    defaultRate: 10,
    taxIdLabel: 'Corporate Number (法人番号)',
    complianceProvider: 'JAPAN_INVOICE',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['PayPay', 'LINE Pay', 'Rakuten Pay'],
    },
    cardGateways: ['Stripe', 'GMO Payment Gateway'],
    bankRails: ['Zengin Direct Bank Transfer', 'Furikomi'],
  },
}
