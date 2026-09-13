import { describe, expect, it } from "vitest";
import {
  countAccommodationsByFilter,
  filterAccommodationList,
  getAccommodationFilterEmptyMessage,
  isPastAccommodation,
  isUpcomingAccommodation,
} from "./filter-accommodation-list";
import type { AccommodationListItemViewModel } from "./types";

function item(
  id: string,
  checkInDate: string,
  checkOutDate: string,
  overrides: Partial<AccommodationListItemViewModel> = {},
): AccommodationListItemViewModel {
  return {
    id,
    tripId: "trip-1",
    placeSource: "manual",
    name: `Hotel ${id}`,
    checkInDate,
    checkOutDate,
    checkInLabel: checkInDate,
    checkOutLabel: checkOutDate,
    dateRangeLabel: `${checkInDate} – ${checkOutDate}`,
    nightCount: 2,
    usesGoogleAttribution: false,
    dateRangeCompactLabel: "24.10 – 27.10",
    nightCountLabel: "2 לילות",
    detailHref: `/accommodations/${id}`,
    isCurrentStay: false,
    ...overrides,
  };
}

describe("filterAccommodationList", () => {
  const currentTripDate = "2026-10-25";
  const items = [
    item("past", "2026-10-20", "2026-10-24"),
    item("current", "2026-10-24", "2026-10-27", { isCurrentStay: true }),
    item("future", "2026-10-28", "2026-10-30"),
  ];

  it("filters upcoming stays including current occupancy", () => {
    expect(
      filterAccommodationList(items, "upcoming", currentTripDate).map((entry) => entry.id),
    ).toEqual(["current", "future"]);
  });

  it("filters past stays by checkout date", () => {
    expect(
      filterAccommodationList(items, "past", currentTripDate).map((entry) => entry.id),
    ).toEqual(["past"]);
  });

  it("returns real filter counts", () => {
    expect(countAccommodationsByFilter(items, currentTripDate)).toEqual({
      all: 3,
      upcoming: 2,
      past: 1,
    });
  });

  it("treats checkout day as past", () => {
    expect(isUpcomingAccommodation("2026-10-25", "2026-10-25")).toBe(false);
    expect(isPastAccommodation("2026-10-25", "2026-10-25")).toBe(true);
  });

  it("returns tab-specific empty messages", () => {
    expect(getAccommodationFilterEmptyMessage("upcoming")).toBe(
      "אין מקומות לינה קרובים",
    );
  });
});
