import { CountryConfig } from '@/lib/countries/types'

export const finlandConfig: CountryConfig = {
  code: 'FI',
  name: 'Finland',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇫🇮',
  timezone: 'Europe/Helsinki',
  tax: {
    name: 'ALV (Arvonlisävero)',
    defaultRate: 25.5,
    taxIdLabel: 'Y-tunnus (Business ID)',
    complianceProvider: 'MAVENTA_FINLAND',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['MobilePay', 'Pivo'],
    },
    cardGateways: ['Paytrail', 'Stripe', 'Klarna'],
    bankRails: ['OP-Pay / Nordea Direct Bank', 'SEPA Direct Debit'],
  },
}
