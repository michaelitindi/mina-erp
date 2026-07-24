import { CountryConfig } from '@/lib/countries/types'

export const saudiArabiaConfig: CountryConfig = {
  code: 'SA',
  name: 'Saudi Arabia',
  currency: 'SAR',
  currencySymbol: 'SR',
  flag: '🇸🇦',
  timezone: 'Asia/Riyadh',
  tax: {
    name: 'VAT (Value Added Tax)',
    defaultRate: 15,
    taxIdLabel: 'VAT Registration Number (الرقم الضريبي)',
    complianceProvider: 'ZATCA_SAUDI',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['STC Pay', 'Urpay'],
    },
    cardGateways: ['MADA', 'HyperPay', 'Tap Payments', 'Stripe'],
    bankRails: ['SADAD Payment System', 'SARIE Bank Transfer'],
  },
}
