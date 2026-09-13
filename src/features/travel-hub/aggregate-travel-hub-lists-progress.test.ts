import { describe, expect, it } from "vitest";
import { aggregateTravelHubListsProgress } from "./aggregate-travel-hub-lists-progress";

describe("aggregateTravelHubListsProgress", () => {
  it("aggregates completion across all lists", () => {
    const progress = aggregateTravelHubListsProgress([
      {
        type: "before_trip",
        slug: "before-trip",
        title: "לפני",
        icon: "grid",
        progress: { totalCount: 4, completedCount: 2 },
        progressLabel: "2 מתוך 4 הושלמו",
      },
      {
        type: "packing",
        slug: "packing",
        title: "אריזה",
        icon: "grid",
        progress: { totalCount: 2, completedCount: 1 },
        progressLabel: "1 מתוך 2 הושלמו",
      },
    ]);

    expect(progress.totalCount).toBe(6);
    expect(progress.completedCount).toBe(3);
    expect(progress.progressLabel).toBe("3 מתוך 6 הושלמו");
  });

  it("returns null progress label when there are no list items", () => {
    const progress = aggregateTravelHubListsProgress([]);

    expect(progress.progressLabel).toBeNull();
  });
});
