const WALL_CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidWallClockTime(value: string): boolean {
  return WALL_CLOCK_TIME_PATTERN.test(value);
}

export function compareWallClockTimes(a: string, b: string): number {
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
