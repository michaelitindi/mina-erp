import { CountryConfig } from '@/lib/countries/types'

export const indiaConfig: CountryConfig = {
  code: 'IN',
  name: 'India',
  currency: 'INR',
  currencySymbol: '₹',
  flag: '🇮🇳',
  timezone: 'Asia/Kolkata',
  tax: {
    name: 'GST (Goods and Services Tax)',
    defaultRate: 18,
    taxIdLabel: 'GSTIN Number',
    complianceProvider: 'GSTIN_INDIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Paytm', 'PhonePe', 'Google Pay'],
    },
    cardGateways: ['Razorpay', 'Cashfree', 'PayU'],
    bankRails: ['UPI Instant Transfer', 'IMPS / NEFT / RTGS'],
  },
}
