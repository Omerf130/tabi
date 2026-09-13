import "server-only";

import { buildAccommodationPhotoHref } from "@/features/place-images/build-place-photo-href";
import { getPlacePhotoPresentation } from "@/features/place-images/get-place-photo-presentation";
import { createPlacePhotoRequestContext } from "@/features/place-images/request-dedupe";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { AccommodationViewModel } from "./types";

export async function attachAccommodationPhotoPresentations(
  tripId: string,
  accommodations: readonly AccommodationViewModel[],
): Promise<Map<string, PlacePhotoPresentation>> {
  const eligible = accommodations.filter(
    (accommodation) =>
      accommodation.placeSource === "google" && accommodation.googlePlaceId,
  );

  if (eligible.length === 0) {
    return new Map();
  }

  const context = createPlacePhotoRequestContext();
  const entries = await Promise.all(
    eligible.map(async (accommodation) => {
      const presentation = await getPlacePhotoPresentation({
        googlePlaceId: accommodation.googlePlaceId!,
        photoHref: buildAccommodationPhotoHref(tripId, accommodation.id),
        context,
      });
      return [accommodation.id, presentation] as const;
    }),
  );

  return new Map(entries);
}
