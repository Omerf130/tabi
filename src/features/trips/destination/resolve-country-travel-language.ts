import {
  lookupCountryTravelLanguage,
  normalizeCountryCode,
  type CountryTravelLanguageEntry,
} from "./country-travel-languages-data";

export type ResolvedCountryTravelLanguage = CountryTravelLanguageEntry | null;

/**
 * Primary and alternative travel languages for an ISO 3166-1 alpha-2 country code (CLDR snapshot).
 * Returns null when the country is unknown or unmapped — never a generic language fallback.
 */
export function resolveCountryTravelLanguage(
  countryCode: string | undefined | null,
): ResolvedCountryTravelLanguage {
  const normalized = normalizeCountryCode(countryCode);
  if (!normalized) {
    return null;
  }

  const entry = lookupCountryTravelLanguage(normalized);
  if (!entry) {
    return null;
  }

  return {
    primary: entry.primary,
    alternatives: [...entry.alternatives],
  };
}
