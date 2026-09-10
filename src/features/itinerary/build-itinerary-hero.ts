import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import type { ItineraryHeroViewModel } from "./types";

export function buildItineraryHero(input: {
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
}): ItineraryHeroViewModel {
  const visual = resolveTripVisualSrc({
    tripId: input.trip.id,
    hasCoverImage: Boolean(input.trip.coverImage),
    coverVisualKey: input.trip.coverVisualKey,
  });

  const identityLabel =
    input.trip.destination?.displayName?.trim() || input.trip.name;

  return {
    title: "מסלול הטיול",
    identityLabel,
    dateRangeLabel: formatCalendarDateRangeDisplay(
      input.trip.startDate,
      input.trip.endDate,
    ),
    heroImageSrc: visual.imageSrc,
  };
}
