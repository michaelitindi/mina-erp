import { CountryConfig } from '@/lib/countries/types'

export const ugandaConfig: CountryConfig = {
  code: 'UG',
  name: 'Uganda',
  currency: 'UGX',
  currencySymbol: 'USh',
  flag: '🇺🇬',
  timezone: 'Africa/Kampala',
  tax: {
    name: 'VAT (Value Added Tax)',
    defaultRate: 18,
    taxIdLabel: 'TIN (Tax Identification Number)',
    complianceProvider: 'URA_EFRIS',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['MTN Mobile Money Uganda', 'Airtel Money Uganda'],
    },
    cardGateways: ['Flutterwave', 'Pesapal Uganda', 'Interswitch UG', 'Stripe'],
    bankRails: ['EFT Direct Bank Transfer', 'Real-Time Gross Settlement (RTGS)'],
  },
}
