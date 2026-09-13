import { buildAccommodationListHref } from "@/features/accommodations/constants";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { TripPhase } from "@/features/trips/trip-phase";
import { selectContextualAccommodation } from "./select-contextual-accommodation";
import type { TravelHubPrimaryToolRow } from "./types";

type BuildTravelHubAccommodationRowInput = {
  tripId: string;
  accommodations: readonly AccommodationViewModel[];
  tripPhase: TripPhase;
  currentTripDate: string;
  accommodationPhotoPresentation?: PlacePhotoPresentation | null;
  t: AppTranslator<"TravelHub">;
};

export function buildTravelHubAccommodationRow({
  tripId,
  accommodations,
  tripPhase,
  currentTripDate,
  accommodationPhotoPresentation = null,
  t,
}: BuildTravelHubAccommodationRowInput): TravelHubPrimaryToolRow {
  const count = accommodations.length;
  const countLabel =
    count === 0
      ? null
      : count === 1
        ? t("accommodationCountOne")
        : t("accommodationCountMany", { count });

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
        ? t("accommodationDetailCurrent", {
            name: contextualSelection.accommodation.name,
          })
        : t("accommodationDetailUpcoming", {
            name: contextualSelection.accommodation.name,
          });

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
    title: t("accommodationTitle"),
    countLabel,
    detailLine: count > 0 ? detailLine : null,
    emptyLine: count === 0 ? t("accommodationEmpty") : null,
    thumbnail,
    showGoogleAttribution,
    thumbnailAlt,
  };
}
