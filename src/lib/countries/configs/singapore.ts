import { CountryConfig } from '@/lib/countries/types'

export const singaporeConfig: CountryConfig = {
  code: 'SG',
  name: 'Singapore',
  currency: 'SGD',
  currencySymbol: '$',
  flag: '🇸🇬',
  timezone: 'Asia/Singapore',
  tax: {
    name: 'GST (Goods and Services Tax)',
    defaultRate: 9,
    taxIdLabel: 'UEN (Unique Entity Number)',
    complianceProvider: 'INVOICENOW_SG',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['GrabPay', 'Singtel Dash'],
    },
    cardGateways: ['Stripe', '2Checkout', 'Airwallex'],
    bankRails: ['PayNow QR Transfer', 'FAST Direct Deposit'],
  },
}
