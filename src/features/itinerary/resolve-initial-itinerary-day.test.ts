import { describe, expect, it } from "vitest";
import { resolveInitialItineraryDay } from "./resolve-initial-itinerary-day";

const trip = { startDate: "2026-10-25", endDate: "2026-11-18" };

describe("resolveInitialItineraryDay", () => {
  it("uses valid requested date within trip range", () => {
    expect(resolveInitialItineraryDay(trip, "2026-10-30", "2026-10-26")).toBe(
      "2026-10-30",
    );
  });

  it("falls back when requested date is invalid or out of range", () => {
    expect(resolveInitialItineraryDay(trip, "2026-02-30", "2026-10-26")).toBe(
      "2026-10-26",
    );
    expect(resolveInitialItineraryDay(trip, "2027-01-01", "2026-10-26")).toBe(
      "2026-10-26",
    );
  });

  it("defaults to first day before trip", () => {
    expect(resolveInitialItineraryDay(trip, null, "2026-10-01")).toBe(
      "2026-10-25",
    );
  });

  it("defaults to today during trip using Japan calendar", () => {
    expect(resolveInitialItineraryDay(trip, null, "2026-10-26")).toBe(
      "2026-10-26",
    );
  });

  it("defaults to last day after trip", () => {
    expect(resolveInitialItineraryDay(trip, null, "2026-12-01")).toBe(
      "2026-11-18",
    );
  });
});
