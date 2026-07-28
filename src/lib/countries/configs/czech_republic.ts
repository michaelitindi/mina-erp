import { CountryConfig } from '@/lib/countries/types'

export const czechRepublicConfig: CountryConfig = {
  code: 'CZ',
  name: 'Czech Republic',
  currency: 'CZK',
  currencySymbol: 'Kč',
  flag: '🇨🇿',
  timezone: 'Europe/Prague',
  tax: {
    name: 'DPH (Daň z přidané hodnoty)',
    defaultRate: 21,
    taxIdLabel: 'DIČ (Daňové identifikační číslo)',
    complianceProvider: 'ISDOC_CZECH',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['PayU Czech', 'Twisto'],
    },
    cardGateways: ['GoPay', 'ComGate', 'Stripe', 'GP webpay'],
    bankRails: ['QR Platba Direct Bank Transfer', 'CERTIS Banking Transfer'],
  },
}
