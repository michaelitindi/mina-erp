import { CountryConfig } from '@/lib/countries/types'

export const norwayConfig: CountryConfig = {
  code: 'NO',
  name: 'Norway',
  currency: 'NOK',
  currencySymbol: 'kr',
  flag: '🇳🇴',
  timezone: 'Europe/Oslo',
  tax: {
    name: 'MVA (Merverdiavgift)',
    defaultRate: 25,
    taxIdLabel: 'Organisasjonsnummer',
    complianceProvider: 'SKATTEETATEN_NORWAY',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Vipps'],
    },
    cardGateways: ['BankAxept', 'Stripe', 'Klarna', 'Nets'],
    bankRails: ['Avtalegiro Direct Debit', 'KID BankGiro Transfer'],
  },
}
