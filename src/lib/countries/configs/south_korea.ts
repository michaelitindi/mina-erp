import { CountryConfig } from '@/lib/countries/types'

export const southKoreaConfig: CountryConfig = {
  code: 'KR',
  name: 'South Korea',
  currency: 'KRW',
  currencySymbol: '₩',
  flag: '🇰🇷',
  timezone: 'Asia/Seoul',
  tax: {
    name: 'VAT (부가가치세)',
    defaultRate: 10,
    taxIdLabel: 'Business Registration Number (사업자등록번호)',
    complianceProvider: 'NTS_KOREA',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['KakaoPay', 'Naver Pay', 'Toss Pay', 'PAYCO'],
    },
    cardGateways: ['KG Inicis', 'NHN KCP', 'Toss Payments', 'Stripe'],
    bankRails: ['KFTC Real-time Bank Transfer', 'Virtual Account Transfer'],
  },
}
