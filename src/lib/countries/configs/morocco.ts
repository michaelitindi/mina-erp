import { CountryConfig } from '@/lib/countries/types'

export const moroccoConfig: CountryConfig = {
  code: 'MA',
  name: 'Morocco',
  currency: 'MAD',
  currencySymbol: 'DH',
  flag: '🇲🇦',
  timezone: 'Africa/Casablanca',
  tax: {
    name: 'TVA (Taxe sur la Valeur Ajoutée)',
    defaultRate: 20,
    taxIdLabel: 'ICE / Identifiant Fiscal (IF)',
    complianceProvider: 'DGI_MOROCCO',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['M-Wallet', 'Orange Money Maroc', 'Maroc Pay'],
    },
    cardGateways: ['CMI (Centre Monétique Interbancaire)', 'PayZone', 'Stripe'],
    bankRails: ['Fatourati / Cash Plus Transfer', 'Virement Bancaire Direct'],
  },
}
