import { CountryConfig } from '@/lib/countries/types'

export const turkeyConfig: CountryConfig = {
  code: 'TR',
  name: 'Turkey',
  currency: 'TRY',
  currencySymbol: '₺',
  flag: '🇹🇷',
  timezone: 'Europe/Istanbul',
  tax: {
    name: 'KDV (Katma Değer Vergisi)',
    defaultRate: 20,
    taxIdLabel: 'VKN / TCKN (Vergi Kimlik No)',
    complianceProvider: 'GIB_TURKEY',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['BKM Express', 'Paycell', 'Papara'],
    },
    cardGateways: ['Iyzico', 'Troy', 'PayU Turkey', 'Stripe'],
    bankRails: ['FAST Anlık Havale', 'EFT / Havale Direct Transfer'],
  },
}
