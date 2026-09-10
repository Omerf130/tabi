import { formatTripDayStripDateLabel } from "./build-itinerary-day-strip";
import { getTripDayNumber } from "@/features/trips/trip-days";

export function formatActivityFormDayContext(
  startDate: string,
  endDate: string,
  date: string,
): string {
  const dayNumber = getTripDayNumber(startDate, endDate, date);
  if (!dayNumber) {
    return formatTripDayStripDateLabel(date);
  }

  return `יום ${dayNumber} · ${formatTripDayStripDateLabel(date)}`;
}
