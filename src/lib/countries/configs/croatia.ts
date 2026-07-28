import { CountryConfig } from '@/lib/countries/types'

export const croatiaConfig: CountryConfig = {
  code: 'HR',
  name: 'Croatia',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇭🇷',
  timezone: 'Europe/Zagreb',
  tax: {
    name: 'PDV (Porez na dodanu vrijednost)',
    defaultRate: 25,
    taxIdLabel: 'OIB (Osobni identifikacijski broj)',
    complianceProvider: 'FISKALIZACIJA_CROATIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['KEKS Pay', 'Aircash'],
    },
    cardGateways: ['CorvusPay', 'WSPay', 'PayWay', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'NKS Direct Bank Transfer'],
  },
}
