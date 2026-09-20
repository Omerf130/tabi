import { getTodayTripLocal } from "@/features/trips/destination/trip-calendar-for-workspace";
import { isDateWithinTrip } from "@/features/trips/trip-days";

export function resolveDefaultActivityDate(
  trip: {
    startDate: string;
    endDate: string;
    destinationCalendarTimeZone: string;
  },
  requestedDate?: string | null,
): string {
  const todayTripLocal = getTodayTripLocal(trip);
  if (
    requestedDate &&
    isDateWithinTrip(trip.startDate, trip.endDate, requestedDate)
  ) {
    return requestedDate;
  }

  if (isDateWithinTrip(trip.startDate, trip.endDate, todayTripLocal)) {
    return todayTripLocal;
  }

  return trip.startDate;
}
