import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import { isAccommodationOccupiedOnDate } from "./accommodation-domain";
import { buildAccommodationLocationLabel } from "./build-accommodation-location-label";
import { buildAccommodationDetailHref } from "./constants";
import { formatAccommodationListDateRange } from "./format-accommodation-list-date-range";
import { formatAccommodationNightCountLabel } from "./format-accommodation-night-count-label";
import type {
  AccommodationListItemViewModel,
  AccommodationViewModel,
} from "./types";

export function buildAccommodationListItem(
  tripId: string,
  accommodation: AccommodationViewModel,
  currentTripDate: string,
  t: AppTranslator<"Accommodation">,
  placePhoto?: PlacePhotoPresentation,
): AccommodationListItemViewModel {
  const locationLabel = buildAccommodationLocationLabel(accommodation);

  return {
    ...accommodation,
    locationLabel,
    dateRangeCompactLabel: formatAccommodationListDateRange(
      accommodation.checkInDate,
      accommodation.checkOutDate,
    ),
    nightCountLabel: formatAccommodationNightCountLabel(accommodation.nightCount, t),
    detailHref: buildAccommodationDetailHref(tripId, accommodation.id),
    isCurrentStay: isAccommodationOccupiedOnDate(
      accommodation.checkInDate,
      accommodation.checkOutDate,
      currentTripDate,
    ),
    placePhoto:
      placePhoto?.hasPhoto && placePhoto.photoHref ? placePhoto : undefined,
  };
}
