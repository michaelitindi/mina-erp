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
import { franceConfig } from './configs/france'
import { italyConfig } from './configs/italy'
import { egyptConfig } from './configs/egypt'
import { indonesiaConfig } from './configs/indonesia'
import { saudiArabiaConfig } from './configs/saudi_arabia'
import { turkeyConfig } from './configs/turkey'
import { argentinaConfig } from './configs/argentina'
import { southKoreaConfig } from './configs/south_korea'
import { chileConfig } from './configs/chile'
import { philippinesConfig } from './configs/philippines'
import { malaysiaConfig } from './configs/malaysia'
import { vietnamConfig } from './configs/vietnam'
import { thailandConfig } from './configs/thailand'
import { pakistanConfig } from './configs/pakistan'
import { polandConfig } from './configs/poland'
import { netherlandsConfig } from './configs/netherlands'
import { swedenConfig } from './configs/sweden'
import { switzerlandConfig } from './configs/switzerland'
import { colombiaConfig } from './configs/colombia'
import { moroccoConfig } from './configs/morocco'
import { peruConfig } from './configs/peru'
import { uruguayConfig } from './configs/uruguay'
import { ecuadorConfig } from './configs/ecuador'
import { paraguayConfig } from './configs/paraguay'
import { boliviaConfig } from './configs/bolivia'
import { norwayConfig } from './configs/norway'
import { denmarkConfig } from './configs/denmark'
import { finlandConfig } from './configs/finland'
import { irelandConfig } from './configs/ireland'
import { portugalConfig } from './configs/portugal'
import { costaRicaConfig } from './configs/costa_rica'
import { panamaConfig } from './configs/panama'
import { dominicanRepublicConfig } from './configs/dominican_republic'
import { guatemalaConfig } from './configs/guatemala'
import { elSalvadorConfig } from './configs/el_salvador'
import { ugandaConfig } from './configs/uganda'
import { tanzaniaConfig } from './configs/tanzania'
import { rwandaConfig } from './configs/rwanda'
import { ethiopiaConfig } from './configs/ethiopia'
import { drCongoConfig } from './configs/dr_congo'
import { austriaConfig } from './configs/austria'
import { belgiumConfig } from './configs/belgium'
import { greeceConfig } from './configs/greece'
import { czechRepublicConfig } from './configs/czech_republic'
import { hungaryConfig } from './configs/hungary'

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
  FR: franceConfig,
  IT: italyConfig,
  EG: egyptConfig,
  ID: indonesiaConfig,
  SA: saudiArabiaConfig,
  TR: turkeyConfig,
  AR: argentinaConfig,
  KR: southKoreaConfig,
  CL: chileConfig,
  PH: philippinesConfig,
  MY: malaysiaConfig,
  VN: vietnamConfig,
  TH: thailandConfig,
  PK: pakistanConfig,
  PL: polandConfig,
  NL: netherlandsConfig,
  SE: swedenConfig,
  CH: switzerlandConfig,
  CO: colombiaConfig,
  MA: moroccoConfig,
  PE: peruConfig,
  UY: uruguayConfig,
  EC: ecuadorConfig,
  PY: paraguayConfig,
  BO: boliviaConfig,
  NO: norwayConfig,
  DK: denmarkConfig,
  FI: finlandConfig,
  IE: irelandConfig,
  PT: portugalConfig,
  CR: costaRicaConfig,
  PA: panamaConfig,
  DO: dominicanRepublicConfig,
  GT: guatemalaConfig,
  SV: elSalvadorConfig,
  UG: ugandaConfig,
  TZ: tanzaniaConfig,
  RW: rwandaConfig,
  ET: ethiopiaConfig,
  CD: drCongoConfig,
  AT: austriaConfig,
  BE: belgiumConfig,
  GR: greeceConfig,
  CZ: czechRepublicConfig,
  HU: hungaryConfig,
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
