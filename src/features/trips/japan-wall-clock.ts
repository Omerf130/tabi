import { TRIP_CALENDAR_TIMEZONE } from "./constants";

const WALL_CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function getJapanWallClockTime(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TRIP_CALENDAR_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  const value = `${hour}:${minute}`;

  if (!WALL_CLOCK_TIME_PATTERN.test(value)) {
    throw new Error(`invalid Japan wall clock time: ${value}`);
  }

  return value;
}
