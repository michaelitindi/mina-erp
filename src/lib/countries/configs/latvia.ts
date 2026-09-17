import { CountryConfig } from '@/lib/countries/types'

export const latviaConfig: CountryConfig = {
  code: 'LV',
  name: 'Latvia',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇱🇻',
  timezone: 'Europe/Riga',
  tax: {
    name: 'PVN (Pievienotās vērtības nodoklis)',
    defaultRate: 21,
    taxIdLabel: 'PVN reģistrācijas numurs',
    complianceProvider: 'VID_LATVIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Mobilly', 'Revolut Pay Latvia'],
    },
    cardGateways: ['Swedbank BankLink', 'SEB eCommerce', 'Citadele', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'Latvijas Banka Instant Transfer'],
  },
}
