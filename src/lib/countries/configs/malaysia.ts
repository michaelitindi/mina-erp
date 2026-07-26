import { CountryConfig } from '@/lib/countries/types'

export const malaysiaConfig: CountryConfig = {
  code: 'MY',
  name: 'Malaysia',
  currency: 'MYR',
  currencySymbol: 'RM',
  flag: '🇲🇾',
  timezone: 'Asia/Kuala_Lumpur',
  tax: {
    name: 'SST (Sales & Services Tax)',
    defaultRate: 8,
    taxIdLabel: 'TIN / MyInvois Number',
    complianceProvider: 'LHDN_MALAYSIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Touch n Go eWallet', 'GrabPay', 'Boost'],
    },
    cardGateways: ['iPay88', 'Curlec by Razorpay', 'Stripe'],
    bankRails: ['DuitNow QR Instant Transfer', 'FPX Online Banking'],
  },
}
