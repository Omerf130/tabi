import { describe, expect, it } from "vitest";
import { FALLBACK_TRIP_CALENDAR_TIMEZONE } from "./constants";
import { isValidIanaTimeZone, normalizeTripCalendarTimeZone } from "./is-valid-iana-time-zone";
import {
  getCalendarDateInTimeZone,
  getWallClockTimeInTimeZone,
} from "./trip-local-calendar";

describe("isValidIanaTimeZone", () => {
  it("accepts known IANA zones", () => {
    expect(isValidIanaTimeZone("Asia/Tokyo")).toBe(true);
    expect(isValidIanaTimeZone("Europe/Rome")).toBe(true);
    expect(isValidIanaTimeZone("America/New_York")).toBe(true);
  });

  it("rejects invalid zones", () => {
    expect(isValidIanaTimeZone("")).toBe(false);
    expect(isValidIanaTimeZone("Not/A_Zone")).toBe(false);
  });

  it("falls back to UTC for invalid normalize input", () => {
    expect(normalizeTripCalendarTimeZone("bad")).toBe(FALLBACK_TRIP_CALENDAR_TIMEZONE);
    expect(normalizeTripCalendarTimeZone("Europe/Rome")).toBe("Europe/Rome");
  });
});

describe("getCalendarDateInTimeZone", () => {
  const instant = new Date("2026-03-21T23:30:00.000Z");

  it("maps the same UTC instant to different local dates by zone", () => {
    expect(getCalendarDateInTimeZone("Asia/Tokyo", instant)).toBe("2026-03-22");
    expect(getCalendarDateInTimeZone("Europe/Rome", instant)).toBe("2026-03-22");
    expect(getCalendarDateInTimeZone("America/New_York", instant)).toBe("2026-03-21");
  });

  it("covers Thailand (Asia/Bangkok) separately from Japan", () => {
    expect(getCalendarDateInTimeZone("Asia/Bangkok", instant)).toBe("2026-03-22");
  });
});

describe("getWallClockTimeInTimeZone", () => {
  it("respects DST in Europe/Rome", () => {
    const winter = new Date("2026-01-15T12:00:00.000Z");
    const summer = new Date("2026-07-15T12:00:00.000Z");
    expect(getWallClockTimeInTimeZone("Europe/Rome", winter)).toBe("13:00");
    expect(getWallClockTimeInTimeZone("Europe/Rome", summer)).toBe("14:00");
  });

  it("respects DST in America/New_York", () => {
    const winter = new Date("2026-01-15T17:00:00.000Z");
    const summer = new Date("2026-07-15T16:00:00.000Z");
    expect(getWallClockTimeInTimeZone("America/New_York", winter)).toBe("12:00");
    expect(getWallClockTimeInTimeZone("America/New_York", summer)).toBe("12:00");
  });
});
