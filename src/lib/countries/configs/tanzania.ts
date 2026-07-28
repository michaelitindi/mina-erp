import { CountryConfig } from '@/lib/countries/types'

export const tanzaniaConfig: CountryConfig = {
  code: 'TZ',
  name: 'Tanzania',
  currency: 'TZS',
  currencySymbol: 'TSh',
  flag: '🇹🇿',
  timezone: 'Africa/Dar_es_Salaam',
  tax: {
    name: 'VAT (Value Added Tax)',
    defaultRate: 18,
    taxIdLabel: 'TIN (Tax Identification Number)',
    complianceProvider: 'TRA_EFD',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['M-Pesa Tanzania', 'Tigo Pesa', 'Airtel Money Tanzania', 'Halopesa'],
    },
    cardGateways: ['Selcom', 'Pesapal Tanzania', 'Stripe'],
    bankRails: ['Tanzania Interbank Settlement System (TISS)', 'NMB / CRDB Direct Transfer'],
  },
}
