const WALL_CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const WALL_CLOCK_TIME_LOOSE_PATTERN = /^(\d|1\d|2[0-3]):([0-5]\d)$/;

export function isValidWallClockTime(value: string): boolean {
  return WALL_CLOCK_TIME_PATTERN.test(value);
}

/** Normalizes legacy single-digit hours (e.g. `9:30`) to canonical `HH:mm`. */
export function normalizeWallClockTime(value: string): string | undefined {
  const trimmed = value.trim();
  if (WALL_CLOCK_TIME_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const loose = trimmed.match(WALL_CLOCK_TIME_LOOSE_PATTERN);
  if (!loose) {
    return undefined;
  }

  const hour = loose[1]!.padStart(2, "0");
  const minute = loose[2]!;
  const normalized = `${hour}:${minute}`;
  return WALL_CLOCK_TIME_PATTERN.test(normalized) ? normalized : undefined;
}

function wallClockToMinutes(value: string): number | null {
  const normalized = normalizeWallClockTime(value);
  if (!normalized) {
    return null;
  }

  const [hourPart, minutePart] = normalized.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

export function compareWallClockTimes(a: string, b: string): number {
  const aMinutes = wallClockToMinutes(a);
  const bMinutes = wallClockToMinutes(b);

  if (aMinutes != null && bMinutes != null) {
    return aMinutes - bMinutes;
  }

  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

export function formatActivityTimeDisplay(
  startTime?: string | null,
  endTime?: string | null,
): string | undefined {
  if (!startTime) {
    return undefined;
  }
  if (endTime) {
    return `${startTime}–${endTime}`;
  }
  return startTime;
}

export function validateActivityTimes(
  startTime?: string | null,
  endTime?: string | null,
): boolean {
  if (endTime && !startTime) {
    return false;
  }
  if (startTime && !isValidWallClockTime(startTime)) {
    return false;
  }
  if (endTime && !isValidWallClockTime(endTime)) {
    return false;
  }
  if (startTime && endTime && compareWallClockTimes(endTime, startTime) < 0) {
    return false;
  }
  return true;
}
