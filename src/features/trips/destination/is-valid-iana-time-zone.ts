import { FALLBACK_TRIP_CALENDAR_TIMEZONE } from "./constants";

export function isValidIanaTimeZone(timeZone: string): boolean {
  const trimmed = timeZone.trim();
  if (!trimmed) {
    return false;
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return true;
  } catch {
    return false;
  }
}

export function normalizeTripCalendarTimeZone(
  timeZone: string | undefined | null,
): string {
  const trimmed = timeZone?.trim();
  if (trimmed && isValidIanaTimeZone(trimmed)) {
    return trimmed;
  }
  return FALLBACK_TRIP_CALENDAR_TIMEZONE;
}
