import { describe, expect, it } from "vitest";
import { resolveNextTwoDayItems } from "./resolve-next-two-day-items";
import type { ActivityViewModel } from "./types";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";

function activity(
  id: string,
  order: number,
  startTime?: string,
  endTime?: string,
): ActivityViewModel {
  return {
    id,
    date: "2026-10-25",
    title: id,
    type: "attraction",
    typeLabel: "אטרקציה",
    order,
    placeSource: "manual",
    startTime,
    endTime,
    timeLabel: startTime,
  };
}

function transport(id: string, departureTime: string): TransportItineraryItemViewModel {
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

describe("resolveNextTwoDayItems", () => {
  it("returns the first two merged items before the trip", () => {
    const items = resolveNextTwoDayItems({
      activities: [activity("a", 0, "10:00"), activity("b", 1, "14:00")],
      transports: [transport("t1", "09:00")],
      filterPassed: false,
    });

    expect(items.map((item) => (item.kind === "activity" ? item.activity.id : item.transport.id))).toEqual([
      "t1",
      "a",
    ]);
  });

  it("filters passed items on the active day", () => {
    const items = resolveNextTwoDayItems({
      activities: [
        activity("a", 0, "08:00", "09:00"),
        activity("b", 1, "14:00"),
        activity("c", 2),
      ],
      transports: [transport("t1", "09:30")],
      filterPassed: true,
      nowJapanTime: "10:00",
    });

    expect(items.map((item) => (item.kind === "activity" ? item.activity.id : item.transport.id))).toEqual([
      "b",
      "c",
    ]);
  });

  it("keeps untimed activities eligible even late in the day", () => {
    const items = resolveNextTwoDayItems({
      activities: [activity("a", 0), activity("b", 1, "08:00", "09:00")],
      transports: [],
      filterPassed: true,
      nowJapanTime: "20:00",
    });

    expect(
      items.map((item) => (item.kind === "activity" ? item.activity.id : item.transport.id)),
    ).toEqual(["a"]);
  });

  it("returns empty when all items have passed", () => {
    const items = resolveNextTwoDayItems({
      activities: [activity("a", 0, "08:00", "09:00")],
      transports: [],
      filterPassed: true,
      nowJapanTime: "10:00",
    });

    expect(items).toHaveLength(0);
  });
});
