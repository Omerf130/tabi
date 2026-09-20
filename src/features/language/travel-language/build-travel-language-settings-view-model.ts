import type { AppLocale } from "@/features/i18n/locale";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { resolveCountryTravelLanguage } from "@/features/trips/destination/resolve-country-travel-language";
import type { TripWorkspace } from "@/features/trips/public-trip";
import {
  getTravelLanguageDisplayName,
  listSupportedTravelLanguageOptions,
  normalizeSelectableTravelLanguageCode,
  type TravelLanguageOption,
} from "../translation/azure-supported-travel-languages";

export type TravelLanguageSelectionSource = "automatic" | "override";

export type TravelLanguageSettingsViewModel = {
  tripId: string;
  isOwner: boolean;
  destinationLabel: string | null;
  destinationDefaultLanguageCode: string | null;
  destinationDefaultLanguageLabel: string | null;
  recommendedLanguages: TravelLanguageOption[];
  effectiveLanguageCode: string | null;
  effectiveLanguageLabel: string | null;
  selectionSource: TravelLanguageSelectionSource;
  overrideLanguageCode: string | null;
  allLanguages: TravelLanguageOption[];
};

function buildRecommendedLanguageCodes(trip: TripWorkspace): string[] {
  const countryEntry = resolveCountryTravelLanguage(trip.destination?.countryCode);
  if (!countryEntry) {
    return [];
  }

  const codes = new Set<string>([
    countryEntry.primary,
    ...countryEntry.alternatives,
  ]);

  return [...codes]
    .map((code) => normalizeSelectableTravelLanguageCode(code))
    .filter((code): code is NonNullable<typeof code> => code !== null);
}

export function buildTravelLanguageSettingsViewModel(input: {
  trip: TripWorkspace;
  isOwner: boolean;
  locale: AppLocale;
  t: AppTranslator<"Settings">;
}): TravelLanguageSettingsViewModel {
  const destinationDefaultLanguageCode = resolveCountryTravelLanguage(
    input.trip.destination?.countryCode,
  )?.primary ?? null;

  const recommendedCodes = buildRecommendedLanguageCodes(input.trip);
  const allLanguages = listSupportedTravelLanguageOptions(input.locale);
  const recommendedLanguages = recommendedCodes
    .map((code) => allLanguages.find((entry) => entry.code === code))
    .filter((entry): entry is TravelLanguageOption => entry !== undefined);

  const effectiveLanguageCode = input.trip.effectiveTravelLanguageCode;
  const overrideLanguageCode = input.trip.travelLanguageCode?.trim() || null;
  const selectionSource: TravelLanguageSelectionSource =
    input.trip.travelLanguageSource === "override" ? "override" : "automatic";

  return {
    tripId: input.trip.id,
    isOwner: input.isOwner,
    destinationLabel: input.trip.destination?.displayName ?? null,
    destinationDefaultLanguageCode,
    destinationDefaultLanguageLabel: destinationDefaultLanguageCode
      ? getTravelLanguageDisplayName(destinationDefaultLanguageCode, input.locale)
      : null,
    recommendedLanguages,
    effectiveLanguageCode,
    effectiveLanguageLabel: effectiveLanguageCode
      ? getTravelLanguageDisplayName(effectiveLanguageCode, input.locale)
      : null,
    selectionSource,
    overrideLanguageCode,
    allLanguages,
  };
}
