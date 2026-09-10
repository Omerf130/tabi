import {
  buildAccommodationDetailHref,
  buildAccommodationListHref,
} from "@/features/accommodations/constants";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import { buildCurrencyHref } from "@/features/currency/constants";
import { buildEmergencyHref } from "@/features/emergency/constants";
import { buildLanguageHref } from "@/features/language/constants";
import { buildTransportHref } from "@/features/transport/constants";
import { buildWeatherHref } from "@/features/weather/constants";
import { buildListDetailHref, buildListsLandingHref } from "@/features/lists/constants";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getTripPhase, type TripPhase } from "@/features/trips/trip-phase";
import { getTripDayCount } from "@/features/trips/trip-days";
import {
  CONTEXTUAL_ACCOMMODATION_TITLES,
  TRAVEL_HUB_MANAGE_HREF,
  TRAVEL_TOOLS,
} from "./constants";
import { selectAttentionList } from "./select-attention-list";
import { selectContextualAccommodation } from "./select-contextual-accommodation";
import type { TravelHubFinanceSummary } from "@/features/finance/types";
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
  lists: readonly TripListSummaryViewModel[];
  todayJapan?: string;
  accommodationPhotoPresentation?: PlacePhotoPresentation | null;
  finance: TravelHubFinanceSummary;
};

function buildToolHref(tripId: string, toolId: (typeof TRAVEL_TOOLS)[number]["id"]): string | undefined {
  switch (toolId) {
    case "accommodations":
      return buildAccommodationListHref(tripId);
    case "lists":
      return buildListsLandingHref(tripId);
    case "currency":
      return buildCurrencyHref(tripId);
    case "weather":
      return buildWeatherHref(tripId);
    case "transport":
      return buildTransportHref(tripId);
    case "language":
      return buildLanguageHref(tripId);
    case "emergency":
      return buildEmergencyHref(tripId);
    case "manage":
      return TRAVEL_HUB_MANAGE_HREF(tripId);
    default:
      return undefined;
  }
}

function buildTripStatusLabel(phase: TripPhase): string {
  switch (phase) {
    case "completed":
      return "טיול הושלם";
    case "active":
      return "בטיול";
    case "upcoming":
      return "לפני הטיול";
  }
}

function buildTripMetaLabel(dayCount: number, statusLabel: string): string {
  const daysLabel = dayCount === 1 ? "יום" : `${dayCount} ימים`;
  return `${daysLabel} • ${statusLabel}`;
}

export function buildTravelHubViewModel({
  trip,
  accommodations,
  lists,
  todayJapan = getJapanCalendarDate(),
  accommodationPhotoPresentation = null,
  finance,
}: BuildTravelHubViewModelInput): TravelHubViewModel {
  const tripId = trip.id;
  const tripPhase = getTripPhase(trip.startDate, trip.endDate, todayJapan);
  const dayCount = getTripDayCount(trip.startDate, trip.endDate);
  const statusLabel = buildTripStatusLabel(tripPhase);
  const visual = resolveTripVisualSrc({
    tripId,
    hasCoverImage: Boolean(trip.coverImage),
    coverVisualKey: trip.coverVisualKey,
  });

  const contextualSelection = selectContextualAccommodation(
    accommodations,
    tripPhase,
    todayJapan,
  );

  const contextualAccommodation = contextualSelection
    ? {
        accommodation: contextualSelection.accommodation,
        variant: contextualSelection.variant,
        title: CONTEXTUAL_ACCOMMODATION_TITLES[contextualSelection.variant],
        detailHref: buildAccommodationDetailHref(
          tripId,
          contextualSelection.accommodation.id,
        ),
        listHref: buildAccommodationListHref(tripId),
        placePhoto:
          accommodationPhotoPresentation?.hasPhoto &&
          accommodationPhotoPresentation.photoHref
            ? accommodationPhotoPresentation
            : undefined,
        showGoogleAttribution: contextualSelection.accommodation.usesGoogleAttribution,
      }
    : null;

  const attentionSelection = selectAttentionList(lists, tripPhase);
  const attentionList = attentionSelection
    ? {
        ...attentionSelection,
        href: buildListDetailHref(tripId, attentionSelection.list.slug),
      }
    : null;

  const tools = TRAVEL_TOOLS.map((tool) => ({
    ...tool,
    href: tool.status === "active" ? buildToolHref(tripId, tool.id) : undefined,
  }));

  return {
    tripId,
    hero: {
      heroImageSrc: visual.imageSrc,
      title: "עוד",
      subtitle: "כלים, מידע והגדרות לטיול שלך",
    },
    myTrip: {
      href: `/app/trips/${tripId}`,
      name: trip.name,
      dateRangeLabel: formatCalendarDateRangeDisplay(trip.startDate, trip.endDate),
      metaLabel: buildTripMetaLabel(dayCount, statusLabel),
      statusLabel,
      heroImageSrc: visual.imageSrc,
    },
    contextualAccommodation,
    attentionList,
    finance,
    tools,
  };
}

