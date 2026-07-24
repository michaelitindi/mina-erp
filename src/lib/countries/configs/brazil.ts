import { CountryConfig } from '@/lib/countries/types'

export const brazilConfig: CountryConfig = {
  code: 'BR',
  name: 'Brazil',
  currency: 'BRL',
  currencySymbol: 'R$',
  flag: '🇧🇷',
  timezone: 'America/Sao_Paulo',
  tax: {
    name: 'ICMS / ISS (VAT)',
    defaultRate: 18,
    taxIdLabel: 'CNPJ Number',
    complianceProvider: 'NFE_BRAZIL',
    requiresFiscalSignature: true,
  },
  payments: {
    mobileMoney: {
      enabled: true,
      providers: ['PicPay', 'Mercado Pago'],
    },
    cardGateways: ['Ebanx', 'Pagar.me', 'Stripe'],
    bankRails: ['PIX Instant Payment', 'Boleto Bancário'],
  },
}
