import { describe, it, expect } from 'vitest'
import { saudiArabiaConfig } from '@/lib/countries/configs/saudi_arabia'
import { turkeyConfig } from '@/lib/countries/configs/turkey'
import { getCountryConfig, COUNTRY_REGISTRY } from '@/lib/countries/registry'

describe('Saudi Arabia Localization Driver Config', () => {
  it('exports correct saudiArabiaConfig properties', () => {
    expect(saudiArabiaConfig).toEqual({
      code: 'SA',
      name: 'Saudi Arabia',
      currency: 'SAR',
      currencySymbol: 'SR',
      flag: '🇸🇦',
      timezone: 'Asia/Riyadh',
      tax: {
        name: 'VAT (Value Added Tax)',
        defaultRate: 15,
        taxIdLabel: 'VAT Registration Number (الرقم الضريبي)',
        complianceProvider: 'ZATCA_SAUDI',
        requiresFiscalSignature: true,
      },
      payments: {
        mobileMoney: {
          enabled: true,
          providers: ['STC Pay', 'Urpay'],
        },
        cardGateways: ['MADA', 'HyperPay', 'Tap Payments', 'Stripe'],
        bankRails: ['SADAD Payment System', 'SARIE Bank Transfer'],
      },
    })
  })

  it('retrieves Saudi Arabia config from country registry by code', () => {
    expect(COUNTRY_REGISTRY['SA']).toBe(saudiArabiaConfig)
    expect(getCountryConfig('SA')).toBe(saudiArabiaConfig)
    expect(getCountryConfig('sa')).toBe(saudiArabiaConfig)
  })
})

describe('Turkey Localization Driver Config', () => {
  it('exports correct turkeyConfig properties', () => {
    expect(turkeyConfig).toEqual({
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
    })
  })

  it('retrieves Turkey config from country registry by code', () => {
    expect(COUNTRY_REGISTRY['TR']).toBe(turkeyConfig)
    expect(getCountryConfig('TR')).toBe(turkeyConfig)
    expect(getCountryConfig('tr')).toBe(turkeyConfig)
  })
})

