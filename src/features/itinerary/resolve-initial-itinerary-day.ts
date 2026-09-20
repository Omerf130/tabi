import { getTodayTripLocal } from "@/features/trips/destination/trip-calendar-for-workspace";
import { getTripPhase } from "@/features/trips/trip-phase";
import { isDateWithinTrip } from "@/features/trips/trip-days";

export function resolveInitialItineraryDay(
  trip: {
    startDate: string;
    endDate: string;
    destinationCalendarTimeZone: string;
  },
  requestedDate?: string | null,
  todayTripLocal = getTodayTripLocal(trip),
): string {
  if (
    requestedDate &&
    isDateWithinTrip(trip.startDate, trip.endDate, requestedDate)
  ) {
    return requestedDate;
  }

  const phase = getTripPhase(trip.startDate, trip.endDate, todayTripLocal);

  if (phase === "upcoming") {
    return trip.startDate;
  }

  if (phase === "completed") {
    return trip.startDate;
  }

  if (isDateWithinTrip(trip.startDate, trip.endDate, todayTripLocal)) {
    return todayTripLocal;
  }

  return trip.startDate;
}
