import { CountryConfig } from '@/lib/countries/types'

export const cyprusConfig: CountryConfig = {
  code: 'CY',
  name: 'Cyprus',
  currency: 'EUR',
  currencySymbol: '€',
  flag: '🇨🇾',
  timezone: 'Asia/Nicosia',
  tax: {
    name: 'VAT (ΦΠΑ - Φόρος Προστιθέμενης Αξίας)',
    defaultRate: 19,
    taxIdLabel: 'TIC (Tax Identification Code) / VAT No',
    complianceProvider: 'TAX_CYPRUS',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['QuickPay (Bank of Cyprus)', 'BOC Pay'],
    },
    cardGateways: ['JCC Payment Systems', 'Stripe', 'Viva Wallet Cyprus'],
    bankRails: ['SEPA Direct Debit', 'JCC Direct Bank Transfer'],
  },
}
