import { CountryConfig } from '@/lib/countries/types'

export const egyptConfig: CountryConfig = {
  code: 'EG',
  name: 'Egypt',
  currency: 'EGP',
  currencySymbol: 'E£',
  flag: '🇪🇬',
  timezone: 'Africa/Cairo',
  tax: {
    name: 'Value Added Tax (VAT)',
    defaultRate: 14,
    taxIdLabel: 'Tax Registration Number (TRN)',
    complianceProvider: 'ETA_EGYPT',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Vodafone Cash', 'Instapay', 'Fawry'],
    },
    cardGateways: ['Paymob', 'Fawry Pay', 'Stripe'],
    bankRails: ['Instapay Bank Transfer', 'ACH Direct Transfer'],
  },
}
