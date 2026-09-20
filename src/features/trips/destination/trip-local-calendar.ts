import { normalizeTripCalendarTimeZone } from "./is-valid-iana-time-zone";

const WALL_CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function getCalendarDateInTimeZone(
  timeZone: string,
  now = new Date(),
): string {
  const zone = normalizeTripCalendarTimeZone(timeZone);
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone }).format(now);
}

export function getWallClockTimeInTimeZone(
  timeZone: string,
  now = new Date(),
): string {
  const zone = normalizeTripCalendarTimeZone(timeZone);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const value = `${hour}:${minute}`;

  if (!WALL_CLOCK_TIME_PATTERN.test(value)) {
    throw new Error(`invalid wall clock time for ${zone}: ${value}`);
  }

  return value;
}
