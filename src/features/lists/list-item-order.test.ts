import { describe, expect, it } from "vitest";
import {
  compareTripListItemsForDisplay,
  getNextTripListItemOrder,
  sortTripListItemsForDisplay,
} from "./list-item-order";

describe("trip list item order", () => {
  it("sorts by order, createdAt, and id", () => {
    const sorted = sortTripListItemsForDisplay([
      { id: "b", order: 1, createdAt: "2026-01-02T00:00:00.000Z" },
      { id: "a", order: 0, createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "c", order: 1, createdAt: "2026-01-01T00:00:00.000Z" },
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });

  it("returns next order as max + 1", () => {
    expect(getNextTripListItemOrder([])).toBe(0);
    expect(getNextTripListItemOrder([{ order: 0 }, { order: 3 }])).toBe(4);
  });

  it("compares items deterministically", () => {
    expect(
      compareTripListItemsForDisplay(
        { id: "a", order: 0, createdAt: "2026-01-01T00:00:00.000Z" },
        { id: "b", order: 1, createdAt: "2026-01-01T00:00:00.000Z" },
      ),
    ).toBeLessThan(0);
  });
});
