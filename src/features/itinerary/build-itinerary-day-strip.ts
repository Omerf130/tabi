import { parseCalendarDateParts } from "@/features/trips/calendar-date";
import {
  getInclusiveDateRange,
  getTripDayNumber,
  getTripDayTemporalState,
} from "@/features/trips/trip-days";
import { buildItineraryDayHref } from "./routes";
import type { ItineraryDayStripItem } from "./types";

export function formatTripDayStripDateLabel(date: string): string {
  const parts = parseCalendarDateParts(date);
  if (!parts) {
    return date;
  }

  const day = String(parts.day).padStart(2, "0");
  const month = String(parts.month).padStart(2, "0");
  return `${day}/${month}`;
}

export function buildItineraryDayStrip(input: {
  tripId: string;
  startDate: string;
  endDate: string;
  selectedDate: string;
  todayJapan: string;
}): ItineraryDayStripItem[] {
  const dates = getInclusiveDateRange(input.startDate, input.endDate);

  return dates.map((date) => {
    const dayNumber = getTripDayNumber(input.startDate, input.endDate, date)!;
    const temporalState = getTripDayTemporalState(date, input.todayJapan);

    return {
      date,
      dayNumber,
      shortDateLabel: formatTripDayStripDateLabel(date),
      href: buildItineraryDayHref(input.tripId, date),
      isSelected: date === input.selectedDate,
      isToday: temporalState === "today",
    };
  });
}
