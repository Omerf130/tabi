import { compareCalendarDates } from "@/features/trips/calendar-date";
import { TRIP_MAX_DURATION_DAYS } from "@/features/trips/constants";
import { getTripDayCount } from "@/features/trips/trip-days";

export type TripDateRangeSelection = {
  startDate: string;
  endDate: string;
};

export function selectTripDateRange(
  current: TripDateRangeSelection,
  nextDate: string,
): TripDateRangeSelection {
  const { startDate, endDate } = current;

  if (!startDate || (startDate && endDate)) {
    return { startDate: nextDate, endDate: "" };
  }

  if (compareCalendarDates(nextDate, startDate) < 0) {
    return { startDate: nextDate, endDate: "" };
  }

  try {
    if (getTripDayCount(startDate, nextDate) > TRIP_MAX_DURATION_DAYS) {
      return { startDate: nextDate, endDate: "" };
    }
  } catch {
    return { startDate: nextDate, endDate: "" };
  }

  return { startDate, endDate: nextDate };
}

export type CalendarDayVisualState =
  | "empty"
  | "default"
  | "today"
  | "range"
  | "range-start"
  | "range-end";

export function getCalendarDayVisualState(
  date: string,
  startDate: string,
  endDate: string,
  todayReference: string,
): CalendarDayVisualState {
  if (startDate && endDate) {
    const afterStart = compareCalendarDates(date, startDate) >= 0;
    const beforeEnd = compareCalendarDates(date, endDate) <= 0;
    if (afterStart && beforeEnd) {
      if (date === startDate && date === endDate) {
        return "range-start";
      }
      if (date === startDate) {
        return "range-start";
      }
      if (date === endDate) {
        return "range-end";
      }
      return "range";
    }
  }

  if (startDate && !endDate && date === startDate) {
    return "range-start";
  }

  if (date === todayReference) {
    return "today";
  }

  return "default";
}
