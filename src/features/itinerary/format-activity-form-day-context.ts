import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { formatTripDayStripDateLabel } from "./build-itinerary-day-strip";
import { getTripDayNumber } from "@/features/trips/trip-days";

export function formatActivityFormDayContext(
  startDate: string,
  endDate: string,
  date: string,
  t: AppTranslator<"Common">,
): string {
  const dayNumber = getTripDayNumber(startDate, endDate, date);
  if (!dayNumber) {
    return formatTripDayStripDateLabel(date);
  }

  return t("dayContext", {
    dayNumber,
    dateLabel: formatTripDayStripDateLabel(date),
  });
}
