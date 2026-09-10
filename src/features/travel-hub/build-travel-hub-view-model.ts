import {
  buildAccommodationDetailHref,
  buildAccommodationPhotoHref,
  buildAccommodationTaxiHref,
  buildAccommodationListHref,
} from "@/features/accommodations/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { buildCurrencyHref } from "@/features/currency/constants";
import { buildEmergencyHref } from "@/features/emergency/constants";
import { buildLanguageHref } from "@/features/language/constants";
import { buildTransportHref } from "@/features/transport/constants";
import { buildWeatherHref } from "@/features/weather/constants";
import { buildListDetailHref, buildListsLandingHref } from "@/features/lists/constants";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getTripPhase } from "@/features/trips/trip-phase";
import {
  CONTEXTUAL_ACCOMMODATION_TITLES,
  TRAVEL_HUB_MANAGE_HREF,
  TRAVEL_TOOLS,
} from "./constants";
import { selectAttentionList } from "./select-attention-list";
import { selectContextualAccommodation } from "./select-contextual-accommodation";
import type { TravelHubViewModel } from "./types";

type BuildTravelHubViewModelInput = {
  tripId: string;
  startDate: string;
  endDate: string;
  accommodations: readonly AccommodationViewModel[];
  lists: readonly TripListSummaryViewModel[];
  todayJapan?: string;
  accommodationPhotoAvailable?: boolean;
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

export function buildTravelHubViewModel({
  tripId,
  startDate,
  endDate,
  accommodations,
  lists,
  todayJapan = getJapanCalendarDate(),
  accommodationPhotoAvailable = false,
}: BuildTravelHubViewModelInput): TravelHubViewModel {
  const tripPhase = getTripPhase(startDate, endDate, todayJapan);
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
        taxiHref: buildAccommodationTaxiHref(
          tripId,
          contextualSelection.accommodation.id,
        ),
        photoHref:
          accommodationPhotoAvailable &&
          contextualSelection.accommodation.googlePlaceId
            ? buildAccommodationPhotoHref(tripId, contextualSelection.accommodation.id)
            : undefined,
        mapsHref: contextualSelection.accommodation.googleMapsUrl,
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
    contextualAccommodation,
    attentionList,
    tools,
  };
}
