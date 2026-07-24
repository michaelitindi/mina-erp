import { CountryConfig } from '@/lib/countries/types'

export const nigeriaConfig: CountryConfig = {
  code: 'NG',
  name: 'Nigeria',
  currency: 'NGN',
  currencySymbol: '₦',
  flag: '🇳🇬',
  timezone: 'Africa/Lagos',
  tax: {
    name: 'FIRS VAT',
    defaultRate: 7.5,
    taxIdLabel: 'Tax Identification Number (TIN)',
    complianceProvider: 'FIRS_VAT',
    requiresFiscalSignature: false,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['OPay', 'Palmpay', 'MTN MoMo'],
    },
    cardGateways: ['Paystack', 'Flutterwave', 'Interswitch'],
    bankRails: ['NIBSS Instant Payment (NIP)', 'Bank Transfer'],
  },
}
