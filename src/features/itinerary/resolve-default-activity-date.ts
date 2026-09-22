import { getCalendarDateInTimeZone } from "@/features/trips/destination/trip-local-calendar";
import type { TripWorkspace } from "@/features/trips/public-trip";

export function clampCalendarDateToTripRange(
  date: string,
  tripStartDate: string,
  tripEndDate: string,
): string {
  if (date < tripStartDate) {
    return tripStartDate;
  }
  if (date > tripEndDate) {
    return tripEndDate;
  }
  return date;
}

/** Default date for new activities only — uses trip destination calendar "today". */
export function resolveDefaultNewActivityDate(input: {
  tripStartDate: string;
  tripEndDate: string;
  destinationCalendarTimeZone: string;
  now?: Date;
}): string {
  const todayTripLocal = getCalendarDateInTimeZone(
    input.destinationCalendarTimeZone,
    input.now,
  );
  return clampCalendarDateToTripRange(
    todayTripLocal,
    input.tripStartDate,
    input.tripEndDate,
  );
}

/** Redirect / quick-open: optional explicit date, otherwise clamped trip-local today. */
export function resolveDefaultActivityDate(
  trip: Pick<
    TripWorkspace,
    "startDate" | "endDate" | "destinationCalendarTimeZone"
  >,
  explicitDate?: string | null,
): string {
  const trimmed = explicitDate?.trim();
  if (trimmed) {
    return clampCalendarDateToTripRange(trimmed, trip.startDate, trip.endDate);
  }

  return resolveDefaultNewActivityDate({
    tripStartDate: trip.startDate,
    tripEndDate: trip.endDate,
    destinationCalendarTimeZone: trip.destinationCalendarTimeZone,
  });
}
