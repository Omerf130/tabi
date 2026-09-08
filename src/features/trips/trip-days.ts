import {
  addCalendarDays,
  compareCalendarDates,
  isValidCalendarDateString,
  parseCalendarDateParts,
} from "./calendar-date";
import { TRIP_MAX_DURATION_DAYS } from "./constants";

export type TripDayTemporalState = "past" | "today" | "future";

export class TripDateRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TripDateRangeError";
  }
}

function toUtcDate(value: string): Date {
  const parts = parseCalendarDateParts(value);
  if (!parts) {
    throw new TripDateRangeError(`invalid calendar date: ${value}`);
  }
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

export function getTripDayCount(startDate: string, endDate: string): number {
  if (!isValidCalendarDateString(startDate) || !isValidCalendarDateString(endDate)) {
    throw new TripDateRangeError("invalid calendar date");
  }
  if (compareCalendarDates(startDate, endDate) > 0) {
    throw new TripDateRangeError("startDate must be before or equal to endDate");
  }

  const startUtc = toUtcDate(startDate);
  const endUtc = toUtcDate(endDate);
  const diffMs = endUtc.getTime() - startUtc.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  return diffDays + 1;
}

export function getInclusiveDateRange(
  startDate: string,
  endDate: string,
  maxDuration = TRIP_MAX_DURATION_DAYS,
): string[] {
  const count = getTripDayCount(startDate, endDate);
  if (count > maxDuration) {
    throw new TripDateRangeError(
      `trip duration exceeds maximum of ${maxDuration} days`,
    );
  }

  const dates: string[] = [];
  let current = startDate;
  while (compareCalendarDates(current, endDate) <= 0) {
    dates.push(current);
    if (current === endDate) {
      break;
    }
    current = addCalendarDays(current, 1);
  }
  return dates;
}

export function isDateWithinTrip(
  startDate: string,
  endDate: string,
  date: string,
): boolean {
  if (!isValidCalendarDateString(date)) {
    return false;
  }
  return (
    compareCalendarDates(date, startDate) >= 0 &&
    compareCalendarDates(date, endDate) <= 0
  );
}

export function getTripDayNumber(
  startDate: string,
  endDate: string,
  date: string,
): number | null {
  if (!isDateWithinTrip(startDate, endDate, date)) {
    return null;
  }

  const startUtc = toUtcDate(startDate);
  const dateUtc = toUtcDate(date);
  const diffMs = dateUtc.getTime() - startUtc.getTime();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  return diffDays + 1;
}

export function getTripDayTemporalState(
  date: string,
  todayJapan: string,
): TripDayTemporalState {
  const compared = compareCalendarDates(date, todayJapan);
  if (compared < 0) {
    return "past";
  }
  if (compared > 0) {
    return "future";
  }
  return "today";
}

export function formatTripDayWeekday(date: string, locale = "he-IL"): string {
  const parts = parseCalendarDateParts(date);
  if (!parts) {
    return date;
  }

  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    weekday: "long",
  }).format(utcDate);
}

export function formatTripDayDateLabel(date: string, locale = "he-IL"): string {
  const parts = parseCalendarDateParts(date);
  if (!parts) {
    return date;
  }

  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  }).format(utcDate);
}

export function formatTripDayHeading(date: string, locale = "he-IL"): string {
  const weekdayLabel = formatTripDayWeekday(date, locale);
  const dateLabel = formatTripDayDateLabel(date, locale);
  return `${weekdayLabel}, ${dateLabel}`;
}
