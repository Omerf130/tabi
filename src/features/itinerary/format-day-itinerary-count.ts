import type { ItineraryDayItem } from "@/features/transport/merge-itinerary-day-items";
import { countItineraryDayItems } from "@/features/transport/merge-itinerary-day-items";
import type { AppTranslator } from "@/features/i18n/create-app-translator";

export function formatDayItineraryCount(
  items: readonly ItineraryDayItem[],
  t: AppTranslator<"Itinerary">,
  tCommon: AppTranslator<"Common">,
): string {
  const { activityCount, transportCount, totalCount } =
    countItineraryDayItems(items);

  if (totalCount === 0) {
    return t("itineraryCount", { count: 0 });
  }

  if (transportCount === 0) {
    return tCommon("activityCount", { count: activityCount });
  }

  if (activityCount === 0) {
    return tCommon("transportCount", { count: transportCount });
  }

  return t("itineraryCountMixed", { count: totalCount });
}
