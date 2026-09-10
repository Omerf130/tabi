import { describe, expect, it } from "vitest";
import { getActiveNavSection } from "@/features/app-shell/navigation";
import {
  buildItineraryDayHref,
  getAdjacentTripDates,
  parseItineraryDateParam,
} from "./routes";

describe("itinerary routes", () => {
  it("validates YYYY-MM-DD and trip date range", () => {
    expect(parseItineraryDateParam("2026-10-26", "2026-10-25", "2026-10-27")).toBe(
      "2026-10-26",
    );
    expect(parseItineraryDateParam("2026-10-24", "2026-10-25", "2026-10-27")).toBeNull();
    expect(parseItineraryDateParam("2026-13-01", "2026-10-25", "2026-10-27")).toBeNull();
    expect(parseItineraryDateParam("not-a-date", "2026-10-25", "2026-10-27")).toBeNull();
  });

  it("builds day hrefs and adjacent navigation", () => {
    expect(buildItineraryDayHref("trip-1", "2026-10-26")).toBe(
      "/app/trips/trip-1/itinerary/2026-10-26",
    );
    expect(
      getAdjacentTripDates(["2026-10-25", "2026-10-26", "2026-10-27"], "2026-10-26"),
    ).toEqual({
      previousDate: "2026-10-25",
      nextDate: "2026-10-27",
    });
  });

  it("keeps bottom nav itinerary active on day route", () => {
    expect(
      getActiveNavSection("/app/trips/trip-1/itinerary/2026-10-26", "trip-1"),
    ).toBe("itinerary");
    expect(getActiveNavSection("/app/trips/trip-1/itinerary", "trip-1")).toBe(
      "itinerary",
    );
  });
});
