import { CountryConfig } from '@/lib/countries/types'

export const ethiopiaConfig: CountryConfig = {
  code: 'ET',
  name: 'Ethiopia',
  currency: 'ETB',
  currencySymbol: 'Br',
  flag: '🇪🇹',
  timezone: 'Africa/Addis_Ababa',
  tax: {
    name: 'VAT / TOT (Value Added Tax)',
    defaultRate: 15,
    taxIdLabel: 'TIN (Tax Identification Number)',
    complianceProvider: 'MOR_ETHIOPIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['Telebirr', 'CBE Birr', 'mPESA Ethiopia'],
    },
    cardGateways: ['Chapa', 'Arifpay', 'Sunpay Ethiopia'],
    bankRails: ['Commercial Bank of Ethiopia (CBE) Direct', 'EthSwitch Transfer'],
  },
}
