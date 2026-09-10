import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getTripPhase } from "@/features/trips/trip-phase";

export function resolveFocusedItineraryDay(
  startDate: string,
  endDate: string,
  todayJapan = getJapanCalendarDate(),
): string | null {
  const phase = getTripPhase(startDate, endDate, todayJapan);

  if (phase === "upcoming") {
    return startDate;
  }

  if (phase === "active") {
    return todayJapan;
  }

  return null;
}
