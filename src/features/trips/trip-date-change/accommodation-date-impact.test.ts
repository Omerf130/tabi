import { describe, expect, it } from "vitest";
import {
  accommodationDatesUnchangedForTrip,
  accommodationOverlapsTripDayRange,
  clampAccommodationDatesToTrip,
} from "./accommodation-date-impact";

describe("accommodation date impact", () => {
  const tripStart = "2026-11-01";
  const tripEnd = "2026-11-18";

  it("detects overlap for partial stays", () => {
    expect(
      accommodationOverlapsTripDayRange("2026-10-28", "2026-11-03", tripStart, tripEnd),
    ).toBe(true);
  });

  it("detects no overlap when fully before the trip", () => {
    expect(
      accommodationOverlapsTripDayRange("2026-10-01", "2026-10-05", tripStart, tripEnd),
    ).toBe(false);
  });

  it("keeps fully inside accommodation unchanged", () => {
    expect(
      accommodationDatesUnchangedForTrip(
        "2026-11-03",
        "2026-11-10",
        tripStart,
        tripEnd,
      ),
    ).toBe(true);
  });

  it("clamps overlapping start boundary", () => {
    expect(
      clampAccommodationDatesToTrip(
        "2026-10-28",
        "2026-11-03",
        tripStart,
        tripEnd,
      ),
    ).toEqual({
      checkInDate: "2026-11-01",
      checkOutDate: "2026-11-03",
    });
  });

  it("clamps overlapping end boundary", () => {
    expect(
      clampAccommodationDatesToTrip(
        "2026-11-15",
        "2026-11-22",
        tripStart,
        tripEnd,
      ),
    ).toEqual({
      checkInDate: "2026-11-15",
      checkOutDate: "2026-11-19",
    });
  });

  it("returns null when there is no overlap", () => {
    expect(
      clampAccommodationDatesToTrip(
        "2026-12-01",
        "2026-12-05",
        tripStart,
        tripEnd,
      ),
    ).toBeNull();
  });
});
