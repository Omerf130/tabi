import { describe, expect, it } from "vitest";
import type { TripListItemViewModel, TripListSummaryViewModel } from "@/features/lists/types";
import {
  buildHomePreparation,
  PREPARATION_PREVIEW_ITEM_LIMIT,
} from "./build-home-preparation";

const tripId = "507f1f77bcf86cd799439011";

function summary(
  type: TripListSummaryViewModel["type"],
  totalCount: number,
  completedCount: number,
): TripListSummaryViewModel {
  return {
    type,
    slug:
      type === "before_trip"
        ? "before-trip"
        : type === "pre_trip_shopping"
          ? "pre-trip-shopping"
          : type === "during_trip"
            ? "during-trip"
            : type,
    title: type,
    icon: "grid",
    progress: { totalCount, completedCount },
    progressLabel: `${completedCount} מתוך ${totalCount} הושלמו`,
  };
}

function item(
  overrides: Partial<TripListItemViewModel> & Pick<TripListItemViewModel, "id">,
): TripListItemViewModel {
  return {
    listType: "packing",
    text: "item",
    isCompleted: false,
    order: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildHomePreparation", () => {
  it("combines totals and percentage across preparation lists", () => {
    const result = buildHomePreparation(
      tripId,
      [
        summary("packing", 8, 5),
        summary("before_trip", 6, 2),
        summary("pre_trip_shopping", 4, 1),
      ],
      [],
    );

    expect(result).toMatchObject({
      totalCount: 18,
      completedCount: 8,
      remainingCount: 10,
      percentage: 44,
      progressLabel: "8 מתוך 18 הושלמו",
    });
  });

  it("returns null when total is zero", () => {
    expect(
      buildHomePreparation(
        tripId,
        [summary("packing", 0, 0), summary("before_trip", 0, 0)],
        [],
      ),
    ).toBeNull();
  });

  it("limits preview items and prefers completed items first", () => {
    const result = buildHomePreparation(
      tripId,
      [summary("packing", 6, 3)],
      [
        item({ id: "1", text: "open 1", isCompleted: false, order: 0 }),
        item({ id: "2", text: "done 1", isCompleted: true, order: 1 }),
        item({ id: "3", text: "done 2", isCompleted: true, order: 2 }),
        item({ id: "4", text: "open 2", isCompleted: false, order: 3 }),
        item({ id: "5", text: "open 3", isCompleted: false, order: 4 }),
      ],
    );

    expect(result?.previewItems).toHaveLength(PREPARATION_PREVIEW_ITEM_LIMIT);
    expect(result?.previewItems.slice(0, 2).every((entry) => entry.isCompleted)).toBe(
      true,
    );
  });
});
