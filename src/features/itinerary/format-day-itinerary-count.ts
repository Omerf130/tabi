import type { ItineraryDayItem } from "@/features/transport/merge-itinerary-day-items";
import { countItineraryDayItems } from "@/features/transport/merge-itinerary-day-items";

export function formatDayItineraryCount(items: readonly ItineraryDayItem[]): string {
  const { activityCount, transportCount, totalCount } = countItineraryDayItems(items);

  if (totalCount === 0) {
    return "אין פריטים";
  }

  if (transportCount === 0) {
    if (activityCount === 1) {
      return "פעילות אחת";
    }
    return `${activityCount} פעילויות`;
  }

  if (activityCount === 0) {
    if (transportCount === 1) {
      return "תחבורה אחת";
    }
    return `${transportCount} תחבורה`;
  }

  return `${totalCount} פריטים`;
}
