import { CountryConfig } from '@/lib/countries/types'

export const pakistanConfig: CountryConfig = {
  code: 'PK',
  name: 'Pakistan',
  currency: 'PKR',
  currencySymbol: 'Rs',
  flag: '🇵🇰',
  timezone: 'Asia/Karachi',
  tax: {
    name: 'Sales Tax / FED',
    defaultRate: 18,
    taxIdLabel: 'NTN (National Tax Number)',
    complianceProvider: 'FBR_PAKISTAN',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['JazzCash', 'Easypaisa', 'SadaPay', 'NayaPay'],
    },
    cardGateways: ['PayPro', 'Safepay', 'Stripe'],
    bankRails: ['Raast Instant Payment', '1LINK IBFT Direct Transfer'],
  },
}
