import "server-only";

import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { buildAccommodationPhotoHref } from "@/features/place-images/build-place-photo-href";
import { getPlacePhotoPresentation } from "@/features/place-images/get-place-photo-presentation";
import { createPlacePhotoRequestContext } from "@/features/place-images/request-dedupe";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { prepareTravelHubFinanceSummary } from "@/features/finance/queries";
import { buildTravelHubViewModel } from "./build-travel-hub-view-model";
import { selectContextualAccommodation } from "./select-contextual-accommodation";
import type { TravelHubViewModel } from "./types";
import { getTripPhase } from "@/features/trips/trip-phase";

type PrepareTravelHubPageInput = {
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
};

export async function prepareTravelHubPage(
  input: PrepareTravelHubPageInput,
): Promise<TravelHubViewModel> {
  const todayJapan = getJapanCalendarDate();
  const tripPhase = getTripPhase(input.trip.startDate, input.trip.endDate, todayJapan);
  const contextualSelection = selectContextualAccommodation(
    input.accommodations,
    tripPhase,
    todayJapan,
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

  return buildTravelHubViewModel({
    trip: input.trip,
    accommodations: input.accommodations,
    lists: input.lists,
    todayJapan,
    accommodationPhotoPresentation,
    finance,
  });
}

