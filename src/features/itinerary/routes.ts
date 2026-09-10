import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import { isDateWithinTrip } from "@/features/trips/trip-days";

export function buildItineraryOverviewHref(tripId: string): string {
  return `/app/trips/${tripId}/itinerary`;
}

export function buildItineraryDayHref(tripId: string, date: string): string {
  return `/app/trips/${tripId}/itinerary/${date}`;
}

export function parseItineraryDateParam(
  value: string,
  startDate: string,
  endDate: string,
): string | null {
  if (!isValidCalendarDateString(value)) {
    return null;
  }
  if (!isDateWithinTrip(startDate, endDate, value)) {
    return null;
  }
  return value;
}

export function getAdjacentTripDates(
  dates: readonly string[],
  currentDate: string,
): { previousDate: string | null; nextDate: string | null } {
  const index = dates.indexOf(currentDate);
  if (index === -1) {
    return { previousDate: null, nextDate: null };
  }
  return {
    previousDate: index > 0 ? dates[index - 1]! : null,
    nextDate: index < dates.length - 1 ? dates[index + 1]! : null,
  };
}

export function parseTransportFromDayParam(
  value: string | undefined,
  startDate: string,
  endDate: string,
): string | null {
  if (!value) {
    return null;
  }
  return parseItineraryDateParam(value, startDate, endDate);
}
