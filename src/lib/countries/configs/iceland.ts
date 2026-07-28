import { CountryConfig } from '@/lib/countries/types'

export const icelandConfig: CountryConfig = {
  code: 'IS',
  name: 'Iceland',
  currency: 'ISK',
  currencySymbol: 'kr',
  flag: '🇮🇸',
  timezone: 'Atlantic/Reykjavik',
  tax: {
    name: 'VSK (Virðisaukaskattur)',
    defaultRate: 24,
    taxIdLabel: 'Kennitala (ID Number)',
    complianceProvider: 'SKATTURINN_ICELAND',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Aur', 'Kass'],
    },
    cardGateways: ['Valitor', 'SaltPay / Borgun', 'Stripe'],
    bankRails: ['Bankaflutningur Direct Transfer', 'Giro Deposit'],
  },
}
