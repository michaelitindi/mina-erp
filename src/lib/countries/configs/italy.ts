import { CountryConfig } from '@/lib/countries/types'

export const italyConfig: CountryConfig = {
  code: 'IT',
  name: 'Italy',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇮🇹',
  timezone: 'Europe/Rome',
  tax: {
    name: 'IVA (Imposta sul Valore Aggiunto)',
    defaultRate: 22,
    taxIdLabel: 'Partita IVA / Codice Fiscale',
    complianceProvider: 'SDI_ITALY',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Satispay', 'Bancomat Pay'],
    },
    cardGateways: ['Nexi', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'Bonifico Bancario'],
  },
}
