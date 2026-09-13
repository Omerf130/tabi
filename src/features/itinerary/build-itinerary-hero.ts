import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import type { ItineraryHeroViewModel } from "./types";

export function buildItineraryHero(
  input: {
    trip: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
      coverImage?: unknown;
      coverVisualKey?: string | null;
      destination?: {
        displayName: string;
      } | null;
    };
  },
  t: AppTranslator<"Itinerary">,
): ItineraryHeroViewModel {
  const visual = resolveTripVisualSrc({
    tripId: input.trip.id,
    hasCoverImage: Boolean(input.trip.coverImage),
    coverVisualKey: input.trip.coverVisualKey,
  });

  const identityLabel =
    input.trip.destination?.displayName?.trim() || input.trip.name;

  return {
    title: t("heroTitle"),
    identityLabel,
    dateRangeLabel: formatCalendarDateRangeDisplay(
      input.trip.startDate,
      input.trip.endDate,
    ),
    heroImageSrc: visual.imageSrc,
  };
}
