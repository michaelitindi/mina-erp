import { CountryConfig } from '@/lib/countries/types'

export const lithuaniaConfig: CountryConfig = {
  code: 'LT',
  name: 'Lithuania',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇱🇹',
  timezone: 'Europe/Vilnius',
  tax: {
    name: 'PVM (Pridėtinės vertės mokestis)',
    defaultRate: 21,
    taxIdLabel: 'PVM mokėtojo kodas',
    complianceProvider: 'VMI_LITHUANIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Paysera Mobile', 'Foxpay'],
    },
    cardGateways: ['Paysera', 'OPAY Lithuania', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'Bank Link (Banklink)'],
  },
}
