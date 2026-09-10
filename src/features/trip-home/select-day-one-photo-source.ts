import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { ActivityViewModel } from "@/features/itinerary/types";
import { mergeItineraryDayItems } from "@/features/transport/merge-itinerary-day-items";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";

export type DayOnePhotoSource =
  | {
      kind: "activity";
      activityId: string;
      googlePlaceId: string;
    }
  | {
      kind: "accommodation";
      accommodationId: string;
      googlePlaceId: string;
    };

export function selectDayOnePhotoSource(
  activities: readonly ActivityViewModel[],
  transports: readonly TransportItineraryItemViewModel[],
  accommodation: AccommodationViewModel | null,
): DayOnePhotoSource | null {
  const merged = mergeItineraryDayItems(activities, transports);

  for (const item of merged) {
    if (item.kind === "activity" && item.activity.googlePlaceId) {
      return {
        kind: "activity",
        activityId: item.activity.id,
        googlePlaceId: item.activity.googlePlaceId,
      };
    }
  }

  if (accommodation?.googlePlaceId) {
    return {
      kind: "accommodation",
      accommodationId: accommodation.id,
      googlePlaceId: accommodation.googlePlaceId,
    };
  }

  return null;
}
