import { describe, expect, it } from "vitest";
import { getMaxAccommodationCheckOutDate } from "./accommodation-date-semantics";

describe("getMaxAccommodationCheckOutDate", () => {
  it("returns the calendar day after the trip end date", () => {
    expect(getMaxAccommodationCheckOutDate("2026-11-18")).toBe("2026-11-19");
  });
});
