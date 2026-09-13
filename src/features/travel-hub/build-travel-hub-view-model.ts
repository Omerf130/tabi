import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import { buildCurrencyHref } from "@/features/currency/constants";
import { buildEmergencyHref } from "@/features/emergency/constants";
import { buildLanguageHref } from "@/features/language/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import type { TravelHubFinanceSummary } from "@/features/finance/types";
import type { TransportRecord } from "@/features/transport/types";
import { buildWeatherHref } from "@/features/weather/constants";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getTripPhase } from "@/features/trips/trip-phase";
import { buildTravelHubAccommodationRow } from "./build-travel-hub-accommodation-row";
import { buildTravelHubDocumentsTile } from "./build-travel-hub-documents-tile";
import { buildTravelHubListsTile } from "./build-travel-hub-lists-tile";
import { buildTravelHubTransportRow } from "./build-travel-hub-transport-row";
import {
  TRAVEL_HUB_HERO,
  TRAVEL_HUB_MANAGE_HREF,
  TRAVEL_HUB_MANAGEMENT_LABEL,
  TRAVEL_HUB_QUICK_TOOLS,
} from "./constants";
import type { TravelHubViewModel } from "./types";

type BuildTravelHubViewModelInput = {
  trip: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    coverImage?: unknown;
    coverVisualKey?: string | null;
  };
  accommodations: readonly AccommodationViewModel[];
  transports: readonly TransportRecord[];
  lists: readonly TripListSummaryViewModel[];
  documentCount: number;
  currentTripDate?: string;
  accommodationPhotoPresentation?: PlacePhotoPresentation | null;
  finance: TravelHubFinanceSummary;
};

function buildQuickToolHref(
  tripId: string,
  toolId: (typeof TRAVEL_HUB_QUICK_TOOLS)[number]["id"],
): string {
  switch (toolId) {
    case "currency":
      return buildCurrencyHref(tripId);
    case "weather":
      return buildWeatherHref(tripId);
    case "language":
      return buildLanguageHref(tripId);
    case "emergency":
      return buildEmergencyHref(tripId);
  }
}

export function buildTravelHubViewModel({
  trip,
  accommodations,
  transports,
  lists,
  documentCount,
  currentTripDate = getJapanCalendarDate(),
  accommodationPhotoPresentation = null,
  finance,
}: BuildTravelHubViewModelInput): TravelHubViewModel {
  const tripId = trip.id;
  const tripPhase = getTripPhase(trip.startDate, trip.endDate, currentTripDate);
  const visual = resolveTripVisualSrc({
    tripId,
    hasCoverImage: Boolean(trip.coverImage),
    coverVisualKey: trip.coverVisualKey,
  });

  return {
    tripId,
    hero: {
      heroImageSrc: visual.imageSrc,
      title: TRAVEL_HUB_HERO.title,
      subtitle: TRAVEL_HUB_HERO.subtitle,
    },
    accommodation: buildTravelHubAccommodationRow({
      tripId,
      accommodations,
      tripPhase,
      currentTripDate,
      accommodationPhotoPresentation,
    }),
    transport: buildTravelHubTransportRow({ tripId, transports }),
    finance,
    materials: {
      lists: buildTravelHubListsTile(tripId, lists),
      documents: buildTravelHubDocumentsTile(tripId, documentCount),
    },
    quickTools: TRAVEL_HUB_QUICK_TOOLS.map((tool) => ({
      id: tool.id,
      label: tool.label,
      description: tool.description,
      href: buildQuickToolHref(tripId, tool.id),
      colorClass: tool.colorClass,
    })),
    management: {
      href: TRAVEL_HUB_MANAGE_HREF(tripId),
      label: TRAVEL_HUB_MANAGEMENT_LABEL,
    },
  };
}
