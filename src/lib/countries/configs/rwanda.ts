import { CountryConfig } from '@/lib/countries/types'

export const rwandaConfig: CountryConfig = {
  code: 'RW',
  name: 'Rwanda',
  currency: 'RWF',
  currencySymbol: 'FRw',
  flag: '🇷🇼',
  timezone: 'Africa/Kigali',
  tax: {
    name: 'VAT (Value Added Tax)',
    defaultRate: 18,
    taxIdLabel: 'TIN (Tax Identification Number)',
    complianceProvider: 'RRA_EBM',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['MTN MoMo Rwanda', 'Airtel Money Rwanda'],
    },
    cardGateways: ['Flutterwave', 'Paypack Rwanda', 'Stripe'],
    bankRails: ['Bank of Kigali Direct Transfer', 'RIPPS Instant Transfer'],
  },
}
