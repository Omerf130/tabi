import type { TripDestinationContext } from "./trip-destination-context";
import { normalizeTravelLanguageCode } from "./normalize-travel-language-code";
import { resolveCountryTravelLanguage } from "./resolve-country-travel-language";

export type TripTravelLanguageSource = "override" | "country-default" | "unknown";

export type ResolvedTripTravelLanguage = {
  /** Explicit owner override stored on Trip (trimmed), when set. */
  travelLanguageCode: string | null;
  /** Resolved language for phrasebook / translation (null when unknown). */
  effectiveTravelLanguageCode: string | null;
  source: TripTravelLanguageSource;
  alternativeTravelLanguageCodes: string[];
};

function readExplicitTravelLanguageCode(
  travelLanguageCode: string | undefined | null,
): string | null {
  if (travelLanguageCode == null) {
    return null;
  }
  const trimmed = travelLanguageCode.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveTripTravelLanguage(input: {
  travelLanguageCode?: string | null;
  countryCode?: string | null;
}): ResolvedTripTravelLanguage {
  const explicit = readExplicitTravelLanguageCode(input.travelLanguageCode);
  const normalizedOverride = normalizeTravelLanguageCode(explicit);
  const countryLanguages = resolveCountryTravelLanguage(input.countryCode);
  const alternatives = countryLanguages?.alternatives ?? [];

  if (normalizedOverride) {
    return {
      travelLanguageCode: explicit,
      effectiveTravelLanguageCode: normalizedOverride,
      source: "override",
      alternativeTravelLanguageCodes: alternatives,
    };
  }

  if (countryLanguages?.primary) {
    return {
      travelLanguageCode: explicit,
      effectiveTravelLanguageCode: countryLanguages.primary,
      source: "country-default",
      alternativeTravelLanguageCodes: alternatives,
    };
  }

  return {
    travelLanguageCode: explicit,
    effectiveTravelLanguageCode: null,
    source: "unknown",
    alternativeTravelLanguageCodes: [],
  };
}

export function resolveTripTravelLanguageFromDestinationContext(
  input: { travelLanguageCode?: string | null },
  destinationContext: Pick<TripDestinationContext, "countryCode">,
): ResolvedTripTravelLanguage {
  return resolveTripTravelLanguage({
    travelLanguageCode: input.travelLanguageCode,
    countryCode: destinationContext.countryCode,
  });
}
