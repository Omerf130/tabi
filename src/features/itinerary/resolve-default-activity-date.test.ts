import { describe, expect, it } from "vitest";
import {
  clampCalendarDateToTripRange,
  resolveDefaultActivityDate,
  resolveDefaultNewActivityDate,
} from "./resolve-default-activity-date";

describe("clampCalendarDateToTripRange", () => {
  const start = "2026-09-15";
  const end = "2026-10-04";

  it("clamps before trip start to start date", () => {
    expect(clampCalendarDateToTripRange("2026-09-10", start, end)).toBe(start);
  });

  it("keeps in-range dates", () => {
    expect(clampCalendarDateToTripRange("2026-09-22", start, end)).toBe("2026-09-22");
  });

  it("clamps after trip end to end date", () => {
    expect(clampCalendarDateToTripRange("2026-10-10", start, end)).toBe(end);
  });
});

describe("resolveDefaultNewActivityDate", () => {
  const tripStart = "2026-09-15";
  const tripEnd = "2026-10-04";

  it("uses trip-local today when inside the trip", () => {
    const instant = new Date("2026-09-22T01:00:00.000Z");
    expect(
      resolveDefaultNewActivityDate({
        tripStartDate: tripStart,
        tripEndDate: tripEnd,
        destinationCalendarTimeZone: "Asia/Tokyo",
        now: instant,
      }),
    ).toBe("2026-09-22");
  });

  it("prefers destination calendar date over browser UTC date at boundaries", () => {
    const instant = new Date("2026-09-21T20:30:00.000Z");
    expect(
      resolveDefaultNewActivityDate({
        tripStartDate: tripStart,
        tripEndDate: tripEnd,
        destinationCalendarTimeZone: "Asia/Tokyo",
        now: instant,
      }),
    ).toBe("2026-09-22");
    expect(
      resolveDefaultNewActivityDate({
        tripStartDate: tripStart,
        tripEndDate: tripEnd,
        destinationCalendarTimeZone: "America/New_York",
        now: instant,
      }),
    ).toBe("2026-09-21");
  });

  it("preserves explicit in-range date for redirect entry", () => {
    expect(
      resolveDefaultActivityDate(
        {
          startDate: tripStart,
          endDate: tripEnd,
          destinationCalendarTimeZone: "UTC",
        },
        "2026-09-20",
      ),
    ).toBe("2026-09-20");
  });

  it("clamps before start and after end", () => {
    expect(
      resolveDefaultNewActivityDate({
        tripStartDate: tripStart,
        tripEndDate: tripEnd,
        destinationCalendarTimeZone: "UTC",
        now: new Date("2026-09-10T12:00:00.000Z"),
      }),
    ).toBe(tripStart);
    expect(
      resolveDefaultNewActivityDate({
        tripStartDate: tripStart,
        tripEndDate: tripEnd,
        destinationCalendarTimeZone: "UTC",
        now: new Date("2026-10-10T12:00:00.000Z"),
      }),
    ).toBe(tripEnd);
  });
});
