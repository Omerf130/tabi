import countryTravelLanguagesSnapshot from "./data/country-travel-languages.json";

export type CountryTravelLanguageEntry = {
  primary: string;
  alternatives: string[];
};

type CountryTravelLanguagesSnapshot = {
  source: string;
  generatedAt: string;
  countries: Record<string, CountryTravelLanguageEntry>;
};

const snapshot = countryTravelLanguagesSnapshot as CountryTravelLanguagesSnapshot;

export function lookupCountryTravelLanguage(
  countryCode: string | undefined | null,
): CountryTravelLanguageEntry | undefined {
  const normalized = countryCode?.trim().toUpperCase();
  if (!normalized) {
    return undefined;
  }
  return snapshot.countries[normalized];
}

export function normalizeCountryCode(
  countryCode: string | undefined | null,
): string | undefined {
  const normalized = countryCode?.trim().toUpperCase();
  if (!normalized) {
    return undefined;
  }
  return normalized;
}
