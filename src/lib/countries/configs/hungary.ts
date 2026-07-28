import { CountryConfig } from '@/lib/countries/types'

export const hungaryConfig: CountryConfig = {
  code: 'HU',
  name: 'Hungary',
  currency: 'HUF',
  currencySymbol: 'Ft',
  flag: '🇭🇺',
  timezone: 'Europe/Budapest',
  tax: {
    name: 'ÁFA (Általános forgalmi adó)',
    defaultRate: 27,
    taxIdLabel: 'Adószám (Tax Number)',
    complianceProvider: 'NAV_HUNGARY',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['SimplePay Mobile', 'Barion Wallet'],
    },
    cardGateways: ['OTP SimplePay', 'Barion', 'Borgun / SaltPay', 'Stripe'],
    bankRails: ['Instant Payment System (AFR / Giro)', 'SEPA Direct Debit'],
  },
}
