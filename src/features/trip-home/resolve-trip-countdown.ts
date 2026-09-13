import { parseCalendarDateParts } from "@/features/trips/calendar-date";

/**
 * Trip Home countdown helpers.
 *
 * Current implementation resolves instants from canonical YYYY-MM-DD calendar
 * dates using UTC midnight boundaries — the same neutral calendar arithmetic
 * used by compareCalendarDates / addCalendarDays.
 *
 * Per-trip destination timezone is NOT modelled yet. When it is, only
 * resolveTripCountdownTargetMs (and preview reference resolution) need to
 * change; presentation components stay unchanged.
 *
 * Legacy note: Trip Home preview/phase code still exposes todayJapan /
 * nowJapanTime field names from older architecture. Those values are accepted
 * here as opaque calendar date + wall-clock coordinates — not as a Japan
 * timezone assertion.
 */

export type TripCountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export type TripCountdownReferenceInput = {
  previewCalendarDate?: string;
  previewWallClock?: string;
};

const WALL_CLOCK_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function calendarDateToUtcMs(calendarDate: string): number | null {
  const parts = parseCalendarDateParts(calendarDate);
  if (!parts) {
    return null;
  }

  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

function calendarDateTimeToUtcMs(
  calendarDate: string,
  wallClock: string,
): number | null {
  const parts = parseCalendarDateParts(calendarDate);
  if (!parts || !WALL_CLOCK_PATTERN.test(wallClock)) {
    return null;
  }

  const [hour, minute] = wallClock.split(":").map(Number);
  return Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute);
}

/** Start-of-trip instant from canonical trip.startDate (UTC calendar boundary). */
export function resolveTripCountdownTargetMs(startDate: string): number {
  const targetMs = calendarDateToUtcMs(startDate);
  if (targetMs === null) {
    throw new Error(`invalid trip start date for countdown: ${startDate}`);
  }
  return targetMs;
}

/**
 * Reference instant for countdown initial render / dev preview.
 * Production callers omit input and the client ticks from Date.now().
 */
export function resolveTripCountdownReferenceMs(
  input?: TripCountdownReferenceInput,
): number | undefined {
  if (!input?.previewCalendarDate || !input.previewWallClock) {
    return undefined;
  }

  const referenceMs = calendarDateTimeToUtcMs(
    input.previewCalendarDate,
    input.previewWallClock,
  );
  if (referenceMs === null) {
    return undefined;
  }

  return referenceMs;
}

export function calculateCountdownParts(
  targetMs: number,
  nowMs: number,
): TripCountdownParts {
  const remainingMs = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(remainingMs / 1000);

  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}
