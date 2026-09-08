import { describe, expect, it } from "vitest";
import {
  formatTripDayHeading,
  formatTripDayWeekday,
  getInclusiveDateRange,
  getTripDayCount,
  getTripDayNumber,
  getTripDayTemporalState,
  isDateWithinTrip,
  TripDateRangeError,
} from "./trip-days";

describe("getTripDayCount", () => {
  it("counts a one-day trip as 1", () => {
    expect(getTripDayCount("2026-10-25", "2026-10-25")).toBe(1);
  });

  it("counts inclusive two-day range", () => {
    expect(getTripDayCount("2026-10-25", "2026-10-26")).toBe(2);
  });

  it("throws when end is before start", () => {
    expect(() => getTripDayCount("2026-11-18", "2026-10-25")).toThrow(
      TripDateRangeError,
    );
  });
});

describe("getInclusiveDateRange", () => {
  it("returns consecutive dates across month boundary", () => {
    expect(getInclusiveDateRange("2026-10-31", "2026-11-02")).toEqual([
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
  });

  it("returns consecutive dates across year boundary", () => {
    expect(getInclusiveDateRange("2025-12-31", "2026-01-01")).toEqual([
      "2025-12-31",
      "2026-01-01",
    ]);
  });

  it("handles leap day", () => {
    expect(getInclusiveDateRange("2024-02-28", "2024-03-01")).toEqual([
      "2024-02-28",
      "2024-02-29",
      "2024-03-01",
    ]);
  });

  it("throws when duration exceeds maximum", () => {
    expect(() =>
      getInclusiveDateRange("2026-01-01", "2026-07-01", 180),
    ).toThrow(TripDateRangeError);
  });
});

describe("isDateWithinTrip", () => {
  it("accepts boundary dates", () => {
    expect(isDateWithinTrip("2026-10-25", "2026-11-18", "2026-10-25")).toBe(
      true,
    );
    expect(isDateWithinTrip("2026-10-25", "2026-11-18", "2026-11-18")).toBe(
      true,
    );
  });

  it("rejects dates outside the trip", () => {
    expect(isDateWithinTrip("2026-10-25", "2026-11-18", "2026-11-19")).toBe(
      false,
    );
    expect(isDateWithinTrip("2026-10-25", "2026-11-18", "2026-10-24")).toBe(
      false,
    );
  });
});

describe("getTripDayNumber", () => {
  it("returns 1 for start date and last for end date", () => {
    expect(getTripDayNumber("2026-10-25", "2026-11-18", "2026-10-25")).toBe(1);
    expect(getTripDayNumber("2026-10-25", "2026-11-18", "2026-11-18")).toBe(25);
  });

  it("returns null for out-of-range dates", () => {
    expect(getTripDayNumber("2026-10-25", "2026-11-18", "2026-12-01")).toBeNull();
  });
});

describe("getTripDayTemporalState", () => {
  it("classifies past, today, and future", () => {
    expect(getTripDayTemporalState("2026-10-24", "2026-10-25")).toBe("past");
    expect(getTripDayTemporalState("2026-10-25", "2026-10-25")).toBe("today");
    expect(getTripDayTemporalState("2026-10-26", "2026-10-25")).toBe("future");
  });
});

describe("Hebrew day labels", () => {
  it("formats weekday and heading for a known date", () => {
    const weekday = formatTripDayWeekday("2026-10-25", "he-IL");
    const heading = formatTripDayHeading("2026-10-25", "he-IL");
    expect(weekday.length).toBeGreaterThan(0);
    expect(heading).toContain("25");
    expect(heading).toContain(weekday);
  });
});

describe("Japan validation range", () => {
  it("generates 25 consecutive days from Oct 25 to Nov 18, 2026", () => {
    const dates = getInclusiveDateRange("2026-10-25", "2026-11-18");
    expect(dates).toHaveLength(25);
    expect(dates[0]).toBe("2026-10-25");
    expect(dates[24]).toBe("2026-11-18");
    expect(new Set(dates).size).toBe(25);
  });
});
