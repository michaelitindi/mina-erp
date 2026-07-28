import { CountryConfig } from '@/lib/countries/types'

export const drCongoConfig: CountryConfig = {
  code: 'CD',
  name: 'Democratic Republic of the Congo',
  currency: 'CDF',
  currencySymbol: 'FC',
  flag: '🇨🇩',
  timezone: 'Africa/Kinshasa',
  tax: {
    name: 'TVA (Taxe sur la Valeur Ajoutée)',
    defaultRate: 16,
    taxIdLabel: "NIF (Numéro d'Identification Fiscale)",
    complianceProvider: 'DGI_DRC',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['M-Pesa RDC', 'Orange Money RDC', 'Airtel Money RDC', 'Afrimoney'],
    },
    cardGateways: ['MaxiCash', 'IllicoCash', 'Stripe'],
    bankRails: ['Rawbank Direct Transfer', 'Virement Bancaire BCDC'],
  },
}
