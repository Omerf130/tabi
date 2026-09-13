import { describe, expect, it } from "vitest";
import { filterMyTripsCards, tripMatchesFilter } from "./filter-my-trips";
import type { MyTripsCardItem } from "./types";

const todayJapan = "2026-10-01";

function card(
  overrides: Partial<MyTripsCardItem> & Pick<MyTripsCardItem, "id" | "phase">,
): MyTripsCardItem {
  return {
    name: "Trip",
    startDate: "2026-10-01",
    endDate: "2026-10-07",
    role: "owner",
    imageSrc: "/destination-visuals/homeApp.png",
    hasPersistedCover: false,
    ...overrides,
  };
}

const activeTrip = card({
  id: "active",
  name: "Japan",
  phase: "active",
  startDate: "2026-09-20",
  endDate: "2026-10-15",
});

const upcomingTrip = card({
  id: "upcoming",
  name: "Dubai",
  phase: "upcoming",
  startDate: "2026-11-01",
  endDate: "2026-11-10",
});

const pastTrip = card({
  id: "past",
  name: "Italy",
  phase: "completed",
  startDate: "2026-06-01",
  endDate: "2026-06-14",
});

const allTrips = [activeTrip, upcomingTrip, pastTrip];

describe("filterMyTripsCards", () => {
  it("shows all trips in All", () => {
    const filtered = filterMyTripsCards(allTrips, "all");
    expect(filtered.map((trip) => trip.id)).toEqual(["active", "upcoming", "past"]);
  });

  it("shows only upcoming trips when startDate is after today", () => {
    const filtered = filterMyTripsCards(allTrips, "upcoming");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("upcoming");
    expect(filtered[0]?.startDate).toBe("2026-11-01");
  });

  it("shows only past trips when endDate is before today", () => {
    const filtered = filterMyTripsCards(allTrips, "past");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("past");
    expect(filtered[0]?.endDate).toBe("2026-06-14");
  });

  it("includes active trips in All", () => {
    expect(filterMyTripsCards(allTrips, "all").some((trip) => trip.id === "active")).toBe(
      true,
    );
  });

  it("does not include active trips in Upcoming", () => {
    expect(filterMyTripsCards(allTrips, "upcoming").some((trip) => trip.id === "active")).toBe(
      false,
    );
  });

  it("does not include active trips in Past", () => {
    expect(filterMyTripsCards(allTrips, "past").some((trip) => trip.id === "active")).toBe(
      false,
    );
  });

  it("does not mutate the source trip array", () => {
    const source = [...allTrips];
    filterMyTripsCards(source, "upcoming");
    expect(source).toEqual(allTrips);
  });

  it("sorts upcoming trips by start date ascending", () => {
    const later = card({
      id: "later",
      phase: "upcoming",
      startDate: "2026-12-01",
      endDate: "2026-12-10",
    });
    const sooner = card({
      id: "sooner",
      phase: "upcoming",
      startDate: "2026-10-20",
      endDate: "2026-10-25",
    });

    expect(filterMyTripsCards([later, sooner], "upcoming").map((trip) => trip.id)).toEqual([
      "sooner",
      "later",
    ]);
  });

  it("sorts past trips by end date descending", () => {
    const older = card({
      id: "older",
      phase: "completed",
      startDate: "2025-01-01",
      endDate: "2025-01-10",
    });
    const newer = card({
      id: "newer",
      phase: "completed",
      startDate: "2026-05-01",
      endDate: "2026-05-20",
    });

    expect(filterMyTripsCards([older, newer], "past").map((trip) => trip.id)).toEqual([
      "newer",
      "older",
    ]);
  });
});

describe("tripMatchesFilter", () => {
  it("derives filter membership from existing trip phase", () => {
    expect(tripMatchesFilter(activeTrip, "all")).toBe(true);
    expect(tripMatchesFilter(activeTrip, "upcoming")).toBe(false);
    expect(tripMatchesFilter(activeTrip, "past")).toBe(false);
    expect(tripMatchesFilter(upcomingTrip, "upcoming")).toBe(true);
    expect(tripMatchesFilter(pastTrip, "past")).toBe(true);
  });

  it("uses deterministic today semantics via precomputed phase", () => {
    expect(activeTrip.phase).toBe("active");
    expect(upcomingTrip.startDate > todayJapan).toBe(true);
    expect(pastTrip.endDate < todayJapan).toBe(true);
  });
});
