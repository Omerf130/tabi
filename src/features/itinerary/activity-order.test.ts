import { describe, expect, it } from "vitest";
import {
  compareActivitiesForDisplay,
  getNextActivityOrder,
  getReorderNeighborId,
  sortActivitiesForDisplay,
} from "./activity-order";

const base = {
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("compareActivitiesForDisplay", () => {
  it("sorts by order, then createdAt, then id", () => {
    const sorted = sortActivitiesForDisplay([
      { id: "b", order: 1, createdAt: "2026-01-02T00:00:00.000Z" },
      { id: "a", order: 0, createdAt: "2026-01-03T00:00:00.000Z" },
      { id: "c", order: 1, createdAt: "2026-01-01T00:00:00.000Z" },
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });
});

describe("getNextActivityOrder", () => {
  it("returns 0 for an empty day", () => {
    expect(getNextActivityOrder([])).toBe(0);
  });

  it("returns max order plus one", () => {
    expect(
      getNextActivityOrder([
        { order: 0 },
        { order: 2 },
        { order: 1 },
      ]),
    ).toBe(3);
  });
});

describe("getReorderNeighborId", () => {
  const dayActivities = [
    { id: "a", order: 0, ...base },
    { id: "b", order: 1, ...base },
    { id: "c", order: 2, ...base },
  ];

  it("finds up and down neighbors in display order", () => {
    expect(getReorderNeighborId(dayActivities, "b", "up")).toBe("a");
    expect(getReorderNeighborId(dayActivities, "b", "down")).toBe("c");
  });

  it("returns null at boundaries", () => {
    expect(getReorderNeighborId(dayActivities, "a", "up")).toBeNull();
    expect(getReorderNeighborId(dayActivities, "c", "down")).toBeNull();
  });

  it("returns null for unknown activity", () => {
    expect(getReorderNeighborId(dayActivities, "missing", "up")).toBeNull();
  });
});

describe("compareActivitiesForDisplay tie-break", () => {
  it("uses id when order and createdAt match", () => {
    const result = compareActivitiesForDisplay(
      { id: "b", order: 0, createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "a", order: 0, createdAt: "2026-01-01T00:00:00.000Z" },
    );
    expect(result).toBeGreaterThan(0);
  });
});
