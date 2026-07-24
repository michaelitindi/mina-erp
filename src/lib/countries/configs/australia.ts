import { CountryConfig } from '@/lib/countries/types'

export const australiaConfig: CountryConfig = {
  code: 'AU',
  name: 'Australia',
  currency: 'AUD',
  currencySymbol: '$',
  flag: '🇦🇺',
  timezone: 'Australia/Sydney',
  tax: {
    name: 'ATO GST',
    defaultRate: 10,
    taxIdLabel: 'Australian Business Number (ABN)',
    complianceProvider: 'ATO_PEPPOL',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['Stripe', 'Tyro', 'eWay'],
    bankRails: ['BECS Direct Debit', 'Osko / PayID (NPP)'],
  },
}
