import { CountryConfig } from '@/lib/countries/types'

export const romaniaConfig: CountryConfig = {
  code: 'RO',
  name: 'Romania',
  currency: 'RON',
  currencySymbol: 'lei',
  flag: '🇷🇴',
  timezone: 'Europe/Bucharest',
  tax: {
    name: 'TVA (Taxa pe Valoarea Adăugată)',
    defaultRate: 19,
    taxIdLabel: 'CUI / CIF (Cod Unic de Înregistrare)',
    complianceProvider: 'ANAF_EFACTURA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['MobilPay', 'BT Pay'],
    },
    cardGateways: ['Netopia Payments', 'PayU Romania', 'Stripe', 'EuPlatesc'],
    bankRails: ['Order de Plata Direct Bank Transfer', 'SEPA Direct Debit'],
  },
}
