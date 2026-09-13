import { compareCalendarDates } from "@/features/trips/calendar-date";
import { sortTripListItems } from "@/features/trips/trip-sort";
import type { MyTripsCardItem } from "./types";

export type MyTripsFilter = "all" | "upcoming" | "past";

export const MY_TRIPS_FILTERS: readonly MyTripsFilter[] = ["all", "upcoming", "past"];

export function filterMyTripsCards(
  trips: readonly MyTripsCardItem[],
  filter: MyTripsFilter,
): MyTripsCardItem[] {
  if (filter === "all") {
    return sortTripListItems([...trips]) as MyTripsCardItem[];
  }

  if (filter === "upcoming") {
    return [...trips]
      .filter((trip) => trip.phase === "upcoming")
      .sort((a, b) => compareCalendarDates(a.startDate, b.startDate));
  }

  return [...trips]
    .filter((trip) => trip.phase === "completed")
    .sort((a, b) => compareCalendarDates(b.endDate, a.endDate));
}

export function tripMatchesFilter(
  trip: MyTripsCardItem,
  filter: MyTripsFilter,
): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "upcoming") {
    return trip.phase === "upcoming";
  }
  return trip.phase === "completed";
}
