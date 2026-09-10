import "server-only";

import { buildActivityPhotoHref } from "@/features/place-images/build-place-photo-href";
import { getPlacePhotoPresentation } from "@/features/place-images/get-place-photo-presentation";
import { createPlacePhotoRequestContext } from "@/features/place-images/request-dedupe";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import { shouldActivityUsePlaceImage } from "./should-activity-use-place-image";
import type { ActivityViewModel } from "./types";

export async function attachActivityPhotoPresentations(
  tripId: string,
  activities: readonly ActivityViewModel[],
): Promise<Map<string, PlacePhotoPresentation>> {
  const eligible = activities.filter((activity) => shouldActivityUsePlaceImage(activity));
  if (eligible.length === 0) {
    return new Map();
  }

  const context = createPlacePhotoRequestContext();
  const entries = await Promise.all(
    eligible.map(async (activity) => {
      const presentation = await getPlacePhotoPresentation({
        googlePlaceId: activity.googlePlaceId!,
        photoHref: buildActivityPhotoHref(tripId, activity.id),
        context,
      });
      return [activity.id, presentation] as const;
    }),
  );

  return new Map(entries);
}
