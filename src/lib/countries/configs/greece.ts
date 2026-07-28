import { CountryConfig } from '@/lib/countries/types'

export const greeceConfig: CountryConfig = {
  code: 'GR',
  name: 'Greece',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇬🇷',
  timezone: 'Europe/Athens',
  tax: {
    name: 'VAT (ΦΠΑ - Φόρος Προστιθέμενης Αξίας)',
    defaultRate: 24,
    taxIdLabel: 'AFM (ΑΦΜ - Αριθμός Φορολογικού Μητρώου)',
    complianceProvider: 'MYDATA_GREECE',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['IRIS Online Payments'],
    },
    cardGateways: ['Viva Wallet', 'Piraeus Cardlink', 'Stripe'],
    bankRails: ['DIAS Interbank Transfer', 'SEPA Direct Debit'],
  },
}
