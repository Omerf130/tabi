import type { TripWorkspace } from "@/features/trips/public-trip";
import {
  getCalendarDateInTimeZone,
  getWallClockTimeInTimeZone,
} from "./trip-local-calendar";

export function getTodayTripLocal(trip: Pick<TripWorkspace, "destinationCalendarTimeZone">): string {
  return getCalendarDateInTimeZone(trip.destinationCalendarTimeZone);
}

export function getNowTripLocalWallClock(
  trip: Pick<TripWorkspace, "destinationCalendarTimeZone">,
): string {
  return getWallClockTimeInTimeZone(trip.destinationCalendarTimeZone);
}
