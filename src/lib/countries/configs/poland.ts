import { CountryConfig } from '@/lib/countries/types'

export const polandConfig: CountryConfig = {
  code: 'PL',
  name: 'Poland',
  currency: 'PLN',
  currencySymbol: 'zł',
  flag: '🇵🇱',
  timezone: 'Europe/Warsaw',
  tax: {
    name: 'VAT (PTU)',
    defaultRate: 23,
    taxIdLabel: 'NIP (Numer Identyfikacji Podatkowej)',
    complianceProvider: 'KSEF_POLAND',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['BLIK Mobile Payment'],
    },
    cardGateways: ['Przelewy24', 'PayU Poland', 'Stripe'],
    bankRails: ['Express Elixir', 'SEPA Direct Debit'],
  },
}
