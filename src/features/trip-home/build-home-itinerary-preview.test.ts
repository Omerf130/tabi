import { describe, expect, it } from "vitest";
import type { ActivityViewModel } from "@/features/itinerary/types";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import {
  buildActiveHomeItineraryPreview,
  buildUpcomingHomeItineraryPreview,
  HOME_ITINERARY_PREVIEW_MAX,
} from "./build-home-itinerary-preview";

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

function transport(
  overrides: Partial<TransportItineraryItemViewModel> &
    Pick<TransportItineraryItemViewModel, "id">,
): TransportItineraryItemViewModel {
  return {
    type: "train",
    typeLabel: "רכבת",
    routeLabel: "קיוטו → אוסקה",
    timeLabel: "09:00",
    departureTime: "09:00",
    detailHref: "/transport/1",
    ...overrides,
  };
}

describe("buildUpcomingHomeItineraryPreview", () => {
  it("merges transport into the preview timeline", () => {
    const preview = buildUpcomingHomeItineraryPreview(
      [
        activity({ id: "a1", title: "A", order: 0, startTime: "10:00" }),
        activity({ id: "a2", title: "B", order: 1, startTime: "12:00" }),
      ],
      [transport({ id: "t1", departureTime: "11:00" })],
    );

    expect(preview.items.map((item) => item.kind)).toEqual([
      "activity",
      "transport",
      "activity",
    ]);
  });

  it("caps preview length", () => {
    const preview = buildUpcomingHomeItineraryPreview(
      Array.from({ length: 6 }, (_, index) =>
        activity({
          id: `a${index}`,
          title: `A${index}`,
          order: index,
          startTime: `${String(8 + index).padStart(2, "0")}:00`,
        }),
      ),
      [],
    );

    expect(preview.items).toHaveLength(HOME_ITINERARY_PREVIEW_MAX);
    expect(preview.overflowCount).toBe(2);
  });
});

describe("buildActiveHomeItineraryPreview", () => {
  it("excludes NOW and UP NEXT activity ids from Today's Plan", () => {
    const preview = buildActiveHomeItineraryPreview(
      [
        activity({
          id: "now",
          title: "Now",
          order: 0,
          startTime: "12:00",
          endTime: "13:00",
        }),
        activity({
          id: "next",
          title: "Next",
          order: 1,
          startTime: "14:00",
        }),
        activity({
          id: "later",
          title: "Later",
          order: 2,
          startTime: "16:00",
        }),
      ],
      [],
      "12:30",
      new Set(["now", "next"]),
    );

    expect(preview.items.map((item) => item.id)).toEqual(["later"]);
  });

  it("keeps transport items even when activities are excluded", () => {
    const preview = buildActiveHomeItineraryPreview(
      [
        activity({
          id: "now",
          title: "Now",
          order: 0,
          startTime: "12:00",
          endTime: "13:00",
        }),
        activity({
          id: "later",
          title: "Later",
          order: 1,
          startTime: "16:00",
        }),
      ],
      [transport({ id: "t1", departureTime: "15:00" })],
      "12:30",
      new Set(["now"]),
    );

    expect(preview.items.map((item) => item.id)).toEqual(["t1", "later"]);
  });
});
