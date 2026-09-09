import "server-only";

import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { getPlacePrimaryPhotoName } from "@/features/places/googlePlaces.server";
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

  let accommodationPhotoAvailable = false;
  const googlePlaceId = contextualSelection?.accommodation.googlePlaceId;
  if (googlePlaceId) {
    const photoName = await getPlacePrimaryPhotoName(googlePlaceId);
    accommodationPhotoAvailable = Boolean(photoName);
  }

  return buildTravelHubViewModel({
    ...input,
    todayJapan,
    accommodationPhotoAvailable,
  });
}
