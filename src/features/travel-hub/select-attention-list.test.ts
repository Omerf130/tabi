import { describe, expect, it } from "vitest";
import type { TripListSummaryViewModel } from "@/features/lists/types";
import { selectAttentionList } from "./select-attention-list";

function makeList(
  type: TripListSummaryViewModel["type"],
  totalCount: number,
  completedCount: number,
): TripListSummaryViewModel {
  return {
    type,
    slug:
      type === "before_trip"
        ? "before-trip"
        : type === "during_trip"
          ? "during-trip"
          : type === "pre_trip_shopping"
            ? "pre-trip-shopping"
            : "packing",
    title: type,
    icon: "grid",
    progress: { totalCount, completedCount },
    progressLabel: `${completedCount} מתוך ${totalCount} הושלמו`,
  };
}

describe("selectAttentionList", () => {
  const lists = [
    makeList("before_trip", 6, 2),
    makeList("pre_trip_shopping", 6, 0),
    makeList("packing", 8, 8),
    makeList("during_trip", 6, 1),
  ];

  it("prioritizes before_trip during upcoming trip", () => {
    const result = selectAttentionList(lists, "upcoming");

    expect(result?.list.type).toBe("before_trip");
    expect(result?.sectionLabel).toBe("לקראת הטיול");
  });

  it("falls through to pre_trip_shopping when before_trip is complete", () => {
    const result = selectAttentionList(
      [
        makeList("before_trip", 6, 6),
        makeList("pre_trip_shopping", 6, 2),
        makeList("packing", 8, 1),
      ],
      "upcoming",
    );

    expect(result?.list.type).toBe("pre_trip_shopping");
  });

  it("falls through to packing when higher-priority lists are complete", () => {
    const result = selectAttentionList(
      [
        makeList("before_trip", 6, 6),
        makeList("pre_trip_shopping", 6, 6),
        makeList("packing", 8, 3),
      ],
      "upcoming",
    );

    expect(result?.list.type).toBe("packing");
  });

  it("only considers during_trip during active trip", () => {
    const result = selectAttentionList(lists, "active");

    expect(result?.list.type).toBe("during_trip");
    expect(result?.sectionLabel).toBe("במהלך הטיול");
  });

  it("skips empty lists", () => {
    const result = selectAttentionList(
      [makeList("before_trip", 0, 0), makeList("packing", 5, 2)],
      "upcoming",
    );

    expect(result?.list.type).toBe("packing");
  });

  it("returns null when all relevant lists are complete", () => {
    const result = selectAttentionList(
      [
        makeList("before_trip", 6, 6),
        makeList("pre_trip_shopping", 6, 6),
        makeList("packing", 8, 8),
      ],
      "upcoming",
    );

    expect(result).toBeNull();
  });

  it("returns null for completed trips", () => {
    expect(selectAttentionList(lists, "completed")).toBeNull();
  });
});
