import { PLACES_SEARCH_LANGUAGE_CODE } from "@/features/places/constants";

/**
 * Google Places detail/display language for trip-scoped lodging resolution.
 * Not the phrasebook language architecture — presentation only.
 */
const COUNTRY_PLACES_DISPLAY_LANGUAGE: Readonly<Record<string, string>> = {
  JP: "ja",
  KR: "ko",
};

export function resolvePlacesDisplayLanguageCode(
  countryCode: string | undefined | null,
): string {
  const normalized = countryCode?.trim().toUpperCase();
  if (!normalized) {
    return PLACES_SEARCH_LANGUAGE_CODE;
  }
  return COUNTRY_PLACES_DISPLAY_LANGUAGE[normalized] ?? PLACES_SEARCH_LANGUAGE_CODE;
}
