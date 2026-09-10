import type { ActivityType } from "./activity-types";
import { isGoogleBackedActivity } from "./activity-place-domain";
import type { ActivityPlaceSource } from "./activity-place-types";

const PLACE_IMAGE_ACTIVITY_TYPES = new Set<ActivityType>([
  "attraction",
  "restaurant",
  "shopping",
  "other",
]);

export function shouldActivityUsePlaceImage(activity: {
  type: ActivityType;
  placeSource: ActivityPlaceSource;
  googlePlaceId?: string;
}): boolean {
  if (!isGoogleBackedActivity(activity)) {
    return false;
  }

  return PLACE_IMAGE_ACTIVITY_TYPES.has(activity.type);
}
