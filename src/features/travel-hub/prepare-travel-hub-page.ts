import "server-only";

import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { buildAccommodationPhotoHref } from "@/features/place-images/build-place-photo-href";
import { getPlacePhotoPresentation } from "@/features/place-images/get-place-photo-presentation";
import { createPlacePhotoRequestContext } from "@/features/place-images/request-dedupe";
import type { TransportRecord } from "@/features/transport/types";
import { getCalendarDateInTimeZone } from "@/features/trips/destination/trip-local-calendar";
import { prepareTravelHubFinanceSummary } from "@/features/finance/queries";
import { getTripPhase } from "@/features/trips/trip-phase";
import { getTranslations } from "next-intl/server";
import { buildTravelHubViewModel } from "./build-travel-hub-view-model";
import { selectContextualAccommodation } from "./select-contextual-accommodation";
import type { TravelHubViewModel } from "./types";

type PrepareTravelHubPageInput = {
  trip: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    coverImage?: unknown;
    coverVisualKey?: string | null;
    destinationCalendarTimeZone: string;
  };
  accommodations: readonly AccommodationViewModel[];
  transports: readonly TransportRecord[];
  lists: readonly TripListSummaryViewModel[];
  documentCount: number;
};

export async function prepareTravelHubPage(
  input: PrepareTravelHubPageInput,
): Promise<TravelHubViewModel> {
  const currentTripDate = getCalendarDateInTimeZone(
    input.trip.destinationCalendarTimeZone,
  );
  const tripPhase = getTripPhase(
    input.trip.startDate,
    input.trip.endDate,
    currentTripDate,
  );
  const contextualSelection = selectContextualAccommodation(
    input.accommodations,
    tripPhase,
    currentTripDate,
  );

  const photoContext = createPlacePhotoRequestContext();
  let accommodationPhotoPresentation = null;

  const googlePlaceId = contextualSelection?.accommodation.googlePlaceId;
  if (googlePlaceId && contextualSelection) {
    accommodationPhotoPresentation = await getPlacePhotoPresentation({
      googlePlaceId,
      photoHref: buildAccommodationPhotoHref(
        input.trip.id,
        contextualSelection.accommodation.id,
      ),
      context: photoContext,
    });
  }

  const finance = await prepareTravelHubFinanceSummary(input.trip.id);
  const t = await getTranslations("TravelHub");
  const tLists = await getTranslations("Lists");

  return buildTravelHubViewModel({
    trip: input.trip,
    accommodations: input.accommodations,
    transports: input.transports,
    lists: input.lists,
    documentCount: input.documentCount,
    currentTripDate,
    accommodationPhotoPresentation,
    finance,
    t,
    tLists,
  });
}
