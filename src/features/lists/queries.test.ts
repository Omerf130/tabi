import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTripListDetail, listTripListsSummary } from "./queries";

const tripId = "507f1f77bcf86cd799439011";

const {
  connectDbMock,
  ensureTripListsSeededMock,
  tripListItemAggregateMock,
  tripListItemFindMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  ensureTripListsSeededMock: vi.fn(),
  tripListItemAggregateMock: vi.fn(),
  tripListItemFindMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("./list-domain", () => ({
  ensureTripListsSeeded: ensureTripListsSeededMock,
}));

vi.mock("@/models/TripListItem", () => ({
  TripListItem: {
    aggregate: tripListItemAggregateMock,
    find: tripListItemFindMock,
  },
}));

describe("trip list queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
    ensureTripListsSeededMock.mockResolvedValue(undefined);
    tripListItemAggregateMock.mockResolvedValue([
      { _id: "packing", totalCount: 8, completedCount: 3 },
      { _id: "before_trip", totalCount: 6, completedCount: 1 },
    ]);
    tripListItemFindMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        {
          _id: { toString: () => "item-1" },
          listType: "packing",
          text: "דרכון",
          isCompleted: true,
          order: 0,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        {
          _id: { toString: () => "item-2" },
          listType: "packing",
          text: "מטען",
          isCompleted: false,
          order: 1,
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
        },
      ]),
    });
  });

  it("derives landing progress from aggregated item data", async () => {
    const lists = await listTripListsSummary(tripId);

    expect(ensureTripListsSeededMock).toHaveBeenCalledWith(tripId);
    expect(lists.find((list) => list.type === "packing")?.progress).toEqual({
      totalCount: 8,
      completedCount: 3,
    });
    expect(lists.find((list) => list.type === "during_trip")?.progress).toEqual({
      totalCount: 0,
      completedCount: 0,
    });
  });

  it("returns sorted list detail with derived progress", async () => {
    const list = await getTripListDetail(tripId, "packing");

    expect(list.progress).toEqual({ totalCount: 2, completedCount: 1 });
    expect(list.progressLabel).toBe("1 מתוך 2 הושלמו");
    expect(list.items.map((item) => item.id)).toEqual(["item-1", "item-2"]);
  });
});
