import { buildAccommodationListHref } from "@/features/accommodations/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { TripPhase } from "@/features/trips/trip-phase";
import { TRAVEL_HUB_ACCOMMODATION } from "./constants";
import { selectContextualAccommodation } from "./select-contextual-accommodation";
import type { TravelHubPrimaryToolRow } from "./types";

type BuildTravelHubAccommodationRowInput = {
  tripId: string;
  accommodations: readonly AccommodationViewModel[];
  tripPhase: TripPhase;
  currentTripDate: string;
  accommodationPhotoPresentation?: PlacePhotoPresentation | null;
};

export function buildTravelHubAccommodationRow({
  tripId,
  accommodations,
  tripPhase,
  currentTripDate,
  accommodationPhotoPresentation = null,
}: BuildTravelHubAccommodationRowInput): TravelHubPrimaryToolRow {
  const count = accommodations.length;
  const countLabel =
    count === 0
      ? null
      : count === 1
        ? TRAVEL_HUB_ACCOMMODATION.countOne
        : TRAVEL_HUB_ACCOMMODATION.countMany(count);

  const contextualSelection = selectContextualAccommodation(
    accommodations,
    tripPhase,
    currentTripDate,
  );

  let detailLine: string | null = null;
  let thumbnail: PlacePhotoPresentation | undefined;
  let showGoogleAttribution: boolean | undefined;
  let thumbnailAlt: string | undefined;

  if (contextualSelection) {
    detailLine =
      contextualSelection.variant === "current"
        ? TRAVEL_HUB_ACCOMMODATION.detailCurrent(contextualSelection.accommodation.name)
        : TRAVEL_HUB_ACCOMMODATION.detailUpcoming(contextualSelection.accommodation.name);

    if (
      accommodationPhotoPresentation?.hasPhoto &&
      accommodationPhotoPresentation.photoHref
    ) {
      thumbnail = accommodationPhotoPresentation;
      showGoogleAttribution = contextualSelection.accommodation.usesGoogleAttribution;
      thumbnailAlt = contextualSelection.accommodation.name;
    }
  }

  return {
    href: buildAccommodationListHref(tripId),
    title: TRAVEL_HUB_ACCOMMODATION.title,
    countLabel,
    detailLine: count > 0 ? detailLine : null,
    emptyLine: count === 0 ? TRAVEL_HUB_ACCOMMODATION.emptyLine : null,
    thumbnail,
    showGoogleAttribution,
    thumbnailAlt,
  };
}
