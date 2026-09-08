import { describe, expect, it } from "vitest";
import { sortTripListItems } from "./trip-sort";
import type { TripListItem } from "./public-trip";

function item(
  id: string,
  phase: TripListItem["phase"],
  startDate: string,
  endDate: string,
): TripListItem {
  return {
    id,
    name: id,
    startDate,
    endDate,
    role: "owner",
    phase,
  };
}

describe("sortTripListItems", () => {
  it("orders active, then upcoming nearest first, then completed most recent first", () => {
    const sorted = sortTripListItems([
      item("completed-old", "completed", "2024-01-01", "2024-01-10"),
      item("upcoming-far", "upcoming", "2027-01-01", "2027-01-10"),
      item("active", "active", "2026-10-01", "2026-10-31"),
      item("upcoming-near", "upcoming", "2026-11-01", "2026-11-10"),
      item("completed-new", "completed", "2025-06-01", "2025-06-20"),
    ]);

    expect(sorted.map((trip) => trip.id)).toEqual([
      "active",
      "upcoming-near",
      "upcoming-far",
      "completed-new",
      "completed-old",
    ]);
  });
});
