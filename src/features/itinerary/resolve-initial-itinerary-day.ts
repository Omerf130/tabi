import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getTripPhase } from "@/features/trips/trip-phase";
import { isDateWithinTrip } from "@/features/trips/trip-days";

export function resolveInitialItineraryDay(
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

  const phase = getTripPhase(trip.startDate, trip.endDate, todayJapan);

  if (phase === "upcoming") {
    return trip.startDate;
  }

  if (phase === "completed") {
    return trip.startDate;
  }

  if (isDateWithinTrip(trip.startDate, trip.endDate, todayJapan)) {
    return todayJapan;
  }

  return trip.startDate;
}
