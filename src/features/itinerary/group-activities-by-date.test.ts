import { describe, expect, it } from "vitest";
import { groupActivitiesByDate } from "./group-activities-by-date";
import type { ActivityViewModel } from "./types";

function activity(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id" | "date" | "order">,
): ActivityViewModel {
  return {
    title: "פעילות",
    type: "other",
    typeLabel: "אחר",
    placeSource: "manual",
    ...overrides,
  };
}

describe("groupActivitiesByDate", () => {
  it("groups activities by date", () => {
    const grouped = groupActivitiesByDate([
      activity({ id: "a", date: "2026-10-25", order: 0 }),
      activity({ id: "b", date: "2026-10-26", order: 0 }),
      activity({ id: "c", date: "2026-10-25", order: 1 }),
    ]);

    expect(grouped.get("2026-10-25")?.map((item) => item.id)).toEqual(["a", "c"]);
    expect(grouped.get("2026-10-26")?.map((item) => item.id)).toEqual(["b"]);
  });

  it("sorts each day by order then id", () => {
    const grouped = groupActivitiesByDate([
      activity({ id: "b", date: "2026-10-25", order: 1 }),
      activity({ id: "a", date: "2026-10-25", order: 0 }),
      activity({ id: "c", date: "2026-10-25", order: 1 }),
    ]);

    expect(grouped.get("2026-10-25")?.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });
});
