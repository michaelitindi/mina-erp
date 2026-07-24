import { CountryConfig } from '@/lib/countries/types'

export const kenyaConfig: CountryConfig = {
  code: 'KE',
  name: 'Kenya',
  currency: 'KES',
  currencySymbol: 'KSh',
  flag: '🇰🇪',
  timezone: 'Africa/Nairobi',
  tax: {
    name: 'VAT / eTIMS',
    defaultRate: 16,
    taxIdLabel: 'KRA PIN Number',
    complianceProvider: 'KRA_ETIMS',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['M-Pesa Express', 'Airtel Money'],
    },
    cardGateways: ['Paystack', 'Flutterwave', 'Stripe'],
    bankRails: ['PesaLink Direct Bank Transfer'],
  },
}
