import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { isDateWithinTrip } from "@/features/trips/trip-days";

export function resolveDefaultActivityDate(
  trip: { startDate: string; endDate: string },
  requestedDate?: string | null,
  todayJapan = getJapanCalendarDate(),
): string {
  if (
    requestedDate &&
    isDateWithinTrip(trip.startDate, trip.endDate, requestedDate)
  ) {
    return requestedDate;
  }

  if (isDateWithinTrip(trip.startDate, trip.endDate, todayJapan)) {
    return todayJapan;
  }

  return trip.startDate;
}
