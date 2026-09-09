import { describe, expect, it } from "vitest";
import { mergeItineraryDayItems } from "./merge-itinerary-day-items";
import type { ActivityViewModel } from "@/features/itinerary/types";
import type { TransportItineraryItemViewModel } from "./types";

function activity(
  id: string,
  order: number,
  startTime?: string,
): ActivityViewModel {
  return {
    id,
    date: "2026-10-25",
    title: id,
    type: "attraction",
    typeLabel: "אטרקציה",
    order,
    startTime,
    timeLabel: startTime,
  };
}

function transport(
  id: string,
  departureTime: string,
): TransportItineraryItemViewModel {
  return {
    id,
    type: "train",
    typeLabel: "רכבת",
    routeLabel: `${id} route`,
    timeLabel: `${departureTime} → 12:00`,
    departureTime,
    detailHref: `/transport/${id}`,
  };
}

describe("mergeItineraryDayItems", () => {
  it("preserves manual activity order", () => {
    const items = mergeItineraryDayItems(
      [activity("a", 2, "10:00"), activity("b", 0), activity("c", 1, "14:00")],
      [],
    );

    expect(items.map((item) => (item.kind === "activity" ? item.activity.id : item.transport.id))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("inserts transport before the first timed activity that starts later", () => {
    const items = mergeItineraryDayItems(
      [activity("a", 0, "10:00"), activity("b", 1), activity("c", 2, "14:00")],
      [transport("t1", "09:30"), transport("t2", "12:00")],
    );

    expect(items.map((item) => item.kind === "activity" ? item.activity.id : item.transport.id)).toEqual([
      "t1",
      "a",
      "b",
      "t2",
      "c",
    ]);
  });

  it("does not move untimed activities when inserting transport", () => {
    const items = mergeItineraryDayItems(
      [activity("a", 0), activity("b", 1, "11:00")],
      [transport("t1", "10:00")],
    );

    expect(items.map((item) => item.kind === "activity" ? item.activity.id : item.transport.id)).toEqual([
      "a",
      "t1",
      "b",
    ]);
  });
});
