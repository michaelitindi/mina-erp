/**
 * Master Country Localization Registry Engine for MinaERP
 */

import { CountryConfig } from './types'
import { kenyaConfig } from './configs/kenya'
import { usConfig } from './configs/us'
import { ukConfig } from './configs/uk'
import { southAfricaConfig } from './configs/south_africa'
import { uaeConfig } from './configs/uae'
import { canadaConfig } from './configs/canada'
import { nigeriaConfig } from './configs/nigeria'
import { australiaConfig } from './configs/australia'
import { indiaConfig } from './configs/india'
import { germanyConfig } from './configs/germany'
import { brazilConfig } from './configs/brazil'
import { japanConfig } from './configs/japan'
import { mexicoConfig } from './configs/mexico'
import { singaporeConfig } from './configs/singapore'
import { spainConfig } from './configs/spain'

export const COUNTRY_REGISTRY: Record<string, CountryConfig> = {
  KE: kenyaConfig,
  US: usConfig,
  GB: ukConfig,
  ZA: southAfricaConfig,
  AE: uaeConfig,
  CA: canadaConfig,
  NG: nigeriaConfig,
  AU: australiaConfig,
  IN: indiaConfig,
  DE: germanyConfig,
  BR: brazilConfig,
  JP: japanConfig,
  MX: mexicoConfig,
  SG: singaporeConfig,
  ES: spainConfig,
}

/**
 * Returns the localized country configuration by 2-letter country code.
 * Defaults to United States (US) if code is unknown.
 */
export function getCountryConfig(code?: string | null): CountryConfig {
  if (!code) return usConfig
  const normalized = code.trim().toUpperCase()
  return COUNTRY_REGISTRY[normalized] || usConfig
}

/**
 * Returns list of all supported localization drivers.
 */
export function getSupportedCountries(): CountryConfig[] {
  return Object.values(COUNTRY_REGISTRY)
}
