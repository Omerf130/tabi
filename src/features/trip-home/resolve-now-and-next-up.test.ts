import { describe, expect, it } from "vitest";
import { resolveNowAndNextUp } from "./resolve-now-and-next-up";
import type { ActivityViewModel } from "@/features/itinerary/types";

function activity(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id" | "order">,
): ActivityViewModel {
  return {
    date: "2026-11-01",
    title: "פעילות",
    type: "other",
    typeLabel: "אחר",
    placeSource: "manual",
    ...overrides,
  };
}

describe("resolveNowAndNextUp", () => {
  it("selects Now when current time is inside start/end range", () => {
    const result = resolveNowAndNextUp(
      [
        activity({
          id: "a",
          order: 0,
          title: "שוק",
          startTime: "12:30",
          endTime: "14:00",
          timeLabel: "12:30–14:00",
        }),
      ],
      "13:00",
    );

    expect(result.nowActivity?.id).toBe("a");
  });

  it("treats endTime as exclusive at the exact end boundary", () => {
    const result = resolveNowAndNextUp(
      [
        activity({
          id: "a",
          order: 0,
          startTime: "12:30",
          endTime: "14:00",
        }),
      ],
      "14:00",
    );

    expect(result.nowActivity).toBeUndefined();
  });

  it("never marks start-only Activities as Now", () => {
    const result = resolveNowAndNextUp(
      [
        activity({
          id: "a",
          order: 0,
          startTime: "16:00",
        }),
      ],
      "16:30",
    );

    expect(result.nowActivity).toBeUndefined();
  });

  it("selects the next future timed Activity and excludes past Activities", () => {
    const result = resolveNowAndNextUp(
      [
        activity({
          id: "past",
          order: 0,
          title: "ארוחת בוקר",
          startTime: "08:00",
          endTime: "09:00",
        }),
        activity({
          id: "next",
          order: 1,
          title: "Fushimi Inari",
          startTime: "16:00",
        }),
      ],
      "10:00",
    );

    expect(result.nowActivity).toBeUndefined();
    expect(result.nextActivity?.id).toBe("next");
  });

  it("uses order then id for same-time deterministic ordering", () => {
    const result = resolveNowAndNextUp(
      [
        activity({ id: "b", order: 1, startTime: "16:00" }),
        activity({ id: "a", order: 0, startTime: "16:00" }),
      ],
      "10:00",
    );

    expect(result.nextActivity?.id).toBe("a");
  });

  it("keeps untimed Activities out of Now/Next Up", () => {
    const result = resolveNowAndNextUp(
      [
        activity({ id: "u", order: 0, title: "זמן חופשי" }),
        activity({ id: "t", order: 1, startTime: "18:00" }),
      ],
      "10:00",
    );

    expect(result.nextActivity?.id).toBe("t");
    expect(result.untimedActivities.map((item) => item.id)).toEqual(["u"]);
  });
});
