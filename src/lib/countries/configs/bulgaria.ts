import { CountryConfig } from '@/lib/countries/types'

export const bulgariaConfig: CountryConfig = {
  code: 'BG',
  name: 'Bulgaria',
  currency: 'BGN',
  currencySymbol: 'лв',
  flag: '🇧🇬',
  timezone: 'Europe/Sofia',
  tax: {
    name: 'DDS (Danak Dobavena Stoynost / ДДС)',
    defaultRate: 20,
    taxIdLabel: 'EIK / VAT Number (ЕИК / ДДС)',
    complianceProvider: 'NAP_BULGARIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['ePay.bg', 'FastPay BG'],
    },
    cardGateways: ['Borica', 'ePay.bg', 'Stripe'],
    bankRails: ['BISERA Bank Transfer', 'SEPA Direct Debit'],
  },
}
