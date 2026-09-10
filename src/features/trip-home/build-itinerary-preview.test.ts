import { describe, expect, it } from "vitest";
import type { ActivityViewModel } from "@/features/itinerary/types";
import {
  buildActiveItineraryPreview,
  buildUpcomingItineraryPreview,
  DAILY_ITINERARY_PREVIEW_MAX,
  selectItineraryPreviewIndices,
} from "./build-itinerary-preview";

function activity(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id">,
): ActivityViewModel {
  return {
    date: "2026-11-01",
    title: "פעילות",
    type: "other",
    typeLabel: "אחר",
    order: 0,
    placeSource: "manual",
    ...overrides,
  };
}

describe("selectItineraryPreviewIndices", () => {
  it("returns all indices when the day fits within the preview limit", () => {
    expect(selectItineraryPreviewIndices(3, 0, [], 4)).toEqual([0, 1, 2]);
  });

  it("always includes now and next indices and expands around the anchor", () => {
    expect(selectItineraryPreviewIndices(8, 3, [2, 5], 4)).toEqual([1, 2, 4, 5]);
  });
});

describe("buildUpcomingItineraryPreview", () => {
  it("returns the first activities in display order up to the preview limit", () => {
    const activities = [
      activity({ id: "a", title: "A", order: 0, startTime: "09:00" }),
      activity({ id: "b", title: "B", order: 1, startTime: "11:00" }),
      activity({ id: "c", title: "C", order: 2, startTime: "13:00" }),
      activity({ id: "d", title: "D", order: 3, startTime: "15:00" }),
      activity({ id: "e", title: "E", order: 4, startTime: "17:00" }),
    ];

    const preview = buildUpcomingItineraryPreview(activities);

    expect(preview.items.map((item) => item.title)).toEqual(["A", "B", "C", "D"]);
    expect(preview.overflowCount).toBe(1);
  });

  it("supports untimed activities without inventing a time", () => {
    const preview = buildUpcomingItineraryPreview([
      activity({ id: "u1", title: "זמן חופשי", order: 0 }),
    ]);

    expect(preview.items[0]).toMatchObject({
      title: "זמן חופשי",
      isUntimed: true,
      displayTime: undefined,
    });
  });
});

describe("buildActiveItineraryPreview", () => {
  it("includes Now and Next Up with emphasis labels", () => {
    const preview = buildActiveItineraryPreview(
      [
        activity({
          id: "early",
          title: "Breakfast",
          order: 0,
          startTime: "08:00",
          endTime: "09:00",
        }),
        activity({
          id: "now",
          title: "Nishiki Market",
          order: 1,
          startTime: "12:30",
          endTime: "14:00",
        }),
        activity({
          id: "next",
          title: "Fushimi Inari",
          order: 2,
          startTime: "16:00",
        }),
        activity({
          id: "late",
          title: "Dinner",
          order: 3,
          startTime: "19:00",
        }),
      ],
      "13:00",
    );

    expect(preview.items.map((item) => item.title)).toEqual([
      "Breakfast",
      "Nishiki Market",
      "Fushimi Inari",
      "Dinner",
    ]);
    expect(preview.items.find((item) => item.id === "now")?.emphasis).toBe("now");
    expect(preview.items.find((item) => item.id === "next")?.emphasis).toBe("next");
  });

  it("limits the preview to the configured maximum", () => {
    const activities = Array.from({ length: 6 }, (_, index) =>
      activity({
        id: `a-${index}`,
        title: `Activity ${index}`,
        order: index,
        startTime: `${String(8 + index).padStart(2, "0")}:00`,
      }),
    );

    const preview = buildActiveItineraryPreview(activities, "08:30");

    expect(preview.items).toHaveLength(DAILY_ITINERARY_PREVIEW_MAX);
    expect(preview.overflowCount).toBe(2);
  });

  it("includes untimed activities in the ordered preview", () => {
    const preview = buildActiveItineraryPreview(
      [
        activity({ id: "timed", title: "Timed", order: 0, startTime: "10:00" }),
        activity({ id: "free", title: "Free time", order: 1 }),
      ],
      "09:00",
    );

    expect(preview.items.map((item) => item.title)).toEqual(["Timed", "Free time"]);
    expect(preview.items[1]?.isUntimed).toBe(true);
  });
});
