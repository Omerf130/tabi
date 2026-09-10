import "server-only";

import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { buildAccommodationPhotoHref } from "@/features/place-images/build-place-photo-href";
import { getPlacePhotoPresentation } from "@/features/place-images/get-place-photo-presentation";
import { createPlacePhotoRequestContext } from "@/features/place-images/request-dedupe";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { buildTravelHubViewModel } from "./build-travel-hub-view-model";
import { selectContextualAccommodation } from "./select-contextual-accommodation";
import type { TravelHubViewModel } from "./types";
import { getTripPhase } from "@/features/trips/trip-phase";

type PrepareTravelHubPageInput = {
  tripId: string;
  startDate: string;
  endDate: string;
  accommodations: readonly AccommodationViewModel[];
  lists: readonly TripListSummaryViewModel[];
};

export async function prepareTravelHubPage(
  input: PrepareTravelHubPageInput,
): Promise<TravelHubViewModel> {
  const todayJapan = getJapanCalendarDate();
  const tripPhase = getTripPhase(input.startDate, input.endDate, todayJapan);
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
        input.tripId,
        contextualSelection.accommodation.id,
      ),
      context: photoContext,
    });
  }

  return buildTravelHubViewModel({
    ...input,
    todayJapan,
    accommodationPhotoPresentation,
  });
}
