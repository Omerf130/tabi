import { describe, expect, it } from "vitest";
import { resolveFocusedItineraryDay } from "./resolve-focused-itinerary-day";

describe("resolveFocusedItineraryDay", () => {
  it("returns Day 1 before the trip starts", () => {
    expect(
      resolveFocusedItineraryDay("2026-10-25", "2026-10-30", "2026-10-20"),
    ).toBe("2026-10-25");
  });

  it("returns the current trip day while active", () => {
    expect(
      resolveFocusedItineraryDay("2026-10-25", "2026-10-30", "2026-10-27"),
    ).toBe("2026-10-27");
  });

  it("returns null after the trip ends", () => {
    expect(
      resolveFocusedItineraryDay("2026-10-25", "2026-10-30", "2026-11-01"),
    ).toBeNull();
  });
});
