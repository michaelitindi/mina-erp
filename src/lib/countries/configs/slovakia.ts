import { CountryConfig } from '@/lib/countries/types'

export const slovakiaConfig: CountryConfig = {
  code: 'SK',
  name: 'Slovakia',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇸🇰',
  timezone: 'Europe/Bratislava',
  tax: {
    name: 'DPH (Daň z pridanej hodnoty)',
    defaultRate: 20,
    taxIdLabel: 'IČ DPH / DIČ',
    complianceProvider: 'FS_SLOVAKIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Viamo Mobile'],
    },
    cardGateways: ['Tatrapay', 'Sporopay', 'Stripe', 'TrustPay'],
    bankRails: ['SEPA Direct Debit', 'SporoPay Instant Transfer'],
  },
}
