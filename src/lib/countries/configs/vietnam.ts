import { CountryConfig } from '@/lib/countries/types'

export const vietnamConfig: CountryConfig = {
  code: 'VN',
  name: 'Vietnam',
  currency: 'VND',
  currencySymbol: '₫',
  flag: '🇻🇳',
  timezone: 'Asia/Ho_Chi_Minh',
  tax: {
    name: 'VAT (Giá trị gia tăng - GTGT)',
    defaultRate: 10,
    taxIdLabel: 'Mã số thuế (Tax Code)',
    complianceProvider: 'GDT_VIETNAM',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['MoMo', 'ZaloPay', 'VNPay-QR', 'ShopeePay'],
    },
    cardGateways: ['OnePay', 'VNPay', 'Stripe'],
    bankRails: ['Napas 247 Instant Transfer', 'Direct Bank Transfer'],
  },
}
