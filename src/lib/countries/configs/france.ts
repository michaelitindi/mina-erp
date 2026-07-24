import { CountryConfig } from '@/lib/countries/types'

export const franceConfig: CountryConfig = {
  code: 'FR',
  name: 'France',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇫🇷',
  timezone: 'Europe/Paris',
  tax: {
    name: 'TVA (Taxe sur la Valeur Ajoutée)',
    defaultRate: 20,
    taxIdLabel: 'Numéro SIRET / TVA',
    complianceProvider: 'CHORUS_FRANCE',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: false,
      providers: [],
    },
    cardGateways: ['Carte Bancaire', 'Stripe', 'Payplug'],
    bankRails: ['SEPA Direct Debit', 'Virement Bancaire'],
  },
}
