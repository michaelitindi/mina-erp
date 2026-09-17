import { CountryConfig } from '@/lib/countries/types'

export const andorraConfig: CountryConfig = {
  code: 'AD',
  name: 'Andorra',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇦🇩',
  timezone: 'Europe/Andorra',
  tax: {
    name: 'IGI (Impost General Indirecte)',
    defaultRate: 4.5,
    taxIdLabel: 'NRT (Número de Registre Tributari)',
    complianceProvider: 'IGI_ANDORRA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['MoraBanc Pay', 'Credit Andorrà Mobile'],
    },
    cardGateways: ['MoraBanc', 'Andbank', 'Stripe'],
    bankRails: ['SEPA Direct Debit', 'Transferència Bancària Directa'],
  },
}
