import { compareCalendarDates } from "@/features/trips/calendar-date";
import type { AccommodationListItemViewModel } from "./types";

export type AccommodationListFilter = "all" | "upcoming" | "past";

export type AccommodationFilterCounts = Record<AccommodationListFilter, number>;

export function isUpcomingAccommodation(
  checkOutDate: string,
  currentTripDate: string,
): boolean {
  return compareCalendarDates(checkOutDate, currentTripDate) > 0;
}

export function isPastAccommodation(
  checkOutDate: string,
  currentTripDate: string,
): boolean {
  return compareCalendarDates(checkOutDate, currentTripDate) <= 0;
}

export function matchesAccommodationListFilter(
  accommodation: Pick<AccommodationListItemViewModel, "checkOutDate">,
  filter: AccommodationListFilter,
  currentTripDate: string,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "upcoming":
      return isUpcomingAccommodation(accommodation.checkOutDate, currentTripDate);
    case "past":
      return isPastAccommodation(accommodation.checkOutDate, currentTripDate);
  }
}

export function filterAccommodationList(
  items: readonly AccommodationListItemViewModel[],
  filter: AccommodationListFilter,
  currentTripDate: string,
): AccommodationListItemViewModel[] {
  if (filter === "all") {
    return [...items];
  }

  return items.filter((item) =>
    matchesAccommodationListFilter(item, filter, currentTripDate),
  );
}

export function countAccommodationsByFilter(
  items: readonly AccommodationListItemViewModel[],
  currentTripDate: string,
): AccommodationFilterCounts {
  return {
    all: items.length,
    upcoming: items.filter((item) =>
      isUpcomingAccommodation(item.checkOutDate, currentTripDate),
    ).length,
    past: items.filter((item) =>
      isPastAccommodation(item.checkOutDate, currentTripDate),
    ).length,
  };
}

export function getAccommodationFilterEmptyMessage(
  filter: AccommodationListFilter,
): string {
  switch (filter) {
    case "all":
      return "אין מקומות לינה";
    case "upcoming":
      return "אין מקומות לינה קרובים";
    case "past":
      return "אין מקומות לינה קודמים";
  }
}

export const ACCOMMODATION_FILTER_TABS: Array<{
  id: AccommodationListFilter;
  label: string;
}> = [
  { id: "all", label: "הכל" },
  { id: "upcoming", label: "בקרוב" },
  { id: "past", label: "עבר" },
];

export function formatAccommodationFilterTabLabel(
  filter: AccommodationListFilter,
  count: number,
): string {
  const base =
    ACCOMMODATION_FILTER_TABS.find((tab) => tab.id === filter)?.label ?? filter;
  return `${base} (${count})`;
}
