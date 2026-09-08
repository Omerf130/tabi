import { TRIP_CALENDAR_TIMEZONE } from "./constants";

const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseCalendarDateParts(
  value: string,
): { year: number; month: number; day: number } | null {
  const match = CALENDAR_DATE_PATTERN.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  return { year, month, day };
}

/** Validates YYYY-MM-DD exists as a calendar day. Uses UTC only to verify the day exists. */
export function isValidCalendarDateString(value: string): boolean {
  const parts = parseCalendarDateParts(value);
  if (!parts) {
    return false;
  }

  const { year, month, day } = parts;
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function normalizeCalendarDateInput(value: string): string | null {
  const trimmed = value.trim();
  if (!isValidCalendarDateString(trimmed)) {
    return null;
  }
  return trimmed;
}

export function compareCalendarDates(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

function formatCalendarDateFromUtcDate(utcDate: Date): string {
  const year = utcDate.getUTCFullYear();
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Adds calendar days to a canonical date string using UTC-probed arithmetic. */
export function addCalendarDays(date: string, delta: number): string {
  if (!isValidCalendarDateString(date)) {
    throw new Error(`invalid calendar date: ${date}`);
  }

  const parts = parseCalendarDateParts(date);
  if (!parts) {
    throw new Error(`invalid calendar date: ${date}`);
  }

  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  utcDate.setUTCDate(utcDate.getUTCDate() + delta);
  return formatCalendarDateFromUtcDate(utcDate);
}

export function getJapanCalendarDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TRIP_CALENDAR_TIMEZONE,
  }).format(now);
}

/** Formats YYYY-MM-DD for display without timezone conversion. */
export function formatCalendarDateDisplay(
  value: string,
  locale = "he-IL",
): string {
  const parts = parseCalendarDateParts(value);
  if (!parts) {
    return value;
  }

  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(utcDate);
}

export function formatCalendarDateRangeDisplay(
  startDate: string,
  endDate: string,
  locale = "he-IL",
): string {
  if (startDate === endDate) {
    return formatCalendarDateDisplay(startDate, locale);
  }
  return `${formatCalendarDateDisplay(startDate, locale)} – ${formatCalendarDateDisplay(endDate, locale)}`;
}
