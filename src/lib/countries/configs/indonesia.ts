import { CountryConfig } from '@/lib/countries/types'

export const indonesiaConfig: CountryConfig = {
  code: 'ID',
  name: 'Indonesia',
  currency: 'IDR',
  currencySymbol: 'Rp',
  flag: '🇮🇩',
  timezone: 'Asia/Jakarta',
  tax: {
    name: 'PPN (Pajak Pertambahan Nilai)',
    defaultRate: 11,
    taxIdLabel: 'NPWP (Nomor Pokok Wajib Pajak)',
    complianceProvider: 'EFAKTUR_INDONESIA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['GoPay', 'OVO', 'DANA', 'ShopeePay'],
    },
    cardGateways: ['Xendit', 'Midtrans', 'DOKU'],
    bankRails: ['QRIS Universal QR', 'BI-FAST Bank Transfer'],
  },
}
