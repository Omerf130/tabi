import { describe, expect, it } from "vitest";
import { isItineraryItemPassed, isTimedActivityPassed } from "./is-itinerary-item-passed";
import type { ActivityViewModel } from "./types";

function activity(
  overrides: Partial<ActivityViewModel> = {},
): ActivityViewModel {
  return {
    id: "a1",
    date: "2026-10-25",
    title: "Museum",
    type: "attraction",
    typeLabel: "אטרקציה",
    order: 0,
    placeSource: "manual",
    ...overrides,
  };
}

describe("isTimedActivityPassed", () => {
  it("uses endTime when present", () => {
    expect(
      isTimedActivityPassed(
        activity({ startTime: "10:00", endTime: "12:00" }),
        "12:00",
      ),
    ).toBe(true);
    expect(
      isTimedActivityPassed(
        activity({ startTime: "10:00", endTime: "12:00" }),
        "11:59",
      ),
    ).toBe(false);
  });

  it("uses startTime only when endTime is missing", () => {
    expect(isTimedActivityPassed(activity({ startTime: "10:00" }), "10:01")).toBe(
      true,
    );
    expect(isTimedActivityPassed(activity({ startTime: "10:00" }), "10:00")).toBe(
      false,
    );
  });

  it("never marks untimed activities as passed", () => {
    expect(isTimedActivityPassed(activity(), "23:59")).toBe(false);
  });
});

describe("isItineraryItemPassed", () => {
  it("marks transport as passed after departure time", () => {
    expect(
      isItineraryItemPassed(
        {
          kind: "transport",
          transport: {
            id: "t1",
            type: "train",
            typeLabel: "רכבת",
            routeLabel: "Tokyo → Kyoto",
            departureTime: "09:00",
            timeLabel: "09:00–11:00",
            detailHref: "/transport/t1",
          },
        },
        "09:01",
      ),
    ).toBe(true);
  });
});
