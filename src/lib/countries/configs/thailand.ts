import { CountryConfig } from '@/lib/countries/types'

export const thailandConfig: CountryConfig = {
  code: 'TH',
  name: 'Thailand',
  currency: 'THB',
  currencySymbol: '฿',
  flag: '🇹🇭',
  timezone: 'Asia/Bangkok',
  tax: {
    name: 'VAT (ภาษีมูลค่าเพิ่ม)',
    defaultRate: 7,
    taxIdLabel: 'Tax ID (เลขประจำตัวผู้เสียภาษี)',
    complianceProvider: 'ETAX_THAILAND',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['TrueMoney Wallet', 'Rabbit LINE Pay', 'ShopeePay'],
    },
    cardGateways: ['Omise / Opn Payments', '2C2P', 'Stripe'],
    bankRails: ['PromptPay QR Transfer', 'BAHTNET Direct Bank Transfer'],
  },
}
