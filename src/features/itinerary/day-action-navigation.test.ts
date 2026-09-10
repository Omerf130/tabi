import { describe, expect, it } from "vitest";
import {
  canDayActionGoBack,
  getDayActionBackTarget,
  shouldShowDayContext,
} from "./day-action-navigation";
import { DAY_ADD_MENU_OPTIONS, getDayActionSurfaceTitle } from "./day-action-menu";
import { formatActivityFormDayContext } from "./format-activity-form-day-context";
import { buildTransportJourneyPreview } from "./build-transport-journey-preview";
import { TRANSPORT_TYPES } from "@/features/transport/transport-types";

describe("add item flow navigation", () => {
  it("lists all supported add item actions including accommodation", () => {
    expect(DAY_ADD_MENU_OPTIONS.map((option) => option.id)).toEqual([
      "activity",
      "transport",
      "accommodation",
      "reminder",
      "document",
    ]);
    expect(DAY_ADD_MENU_OPTIONS.every((option) => option.description.length > 0)).toBe(
      true,
    );
  });

  it("uses the planner chooser title and day context", () => {
    expect(getDayActionSurfaceTitle({ kind: "menu" })).toBe("הוספה ליום");
    expect(formatActivityFormDayContext("2026-10-25", "2026-11-18", "2026-10-27")).toBe(
      "יום 3 · 27/10",
    );
  });

  it("returns to the chooser from child create flows", () => {
    expect(getDayActionBackTarget({ kind: "activity-create" })).toEqual({
      kind: "menu",
    });
    expect(getDayActionBackTarget({ kind: "accommodation-create" })).toEqual({
      kind: "menu",
    });
    expect(getDayActionBackTarget({ kind: "transport-type" })).toEqual({
      kind: "menu",
    });
    expect(getDayActionBackTarget({ kind: "transport-create", transportType: "train" })).toEqual({
      kind: "transport-type",
    });
    expect(canDayActionGoBack({ kind: "activity-edit", activityId: "a1" })).toBe(false);
  });

  it("shows day context on create flows but not edit-only flows", () => {
    expect(shouldShowDayContext({ kind: "menu" })).toBe(false);
    expect(shouldShowDayContext({ kind: "activity-create" })).toBe(true);
    expect(shouldShowDayContext({ kind: "transport-create", transportType: "flight" })).toBe(
      true,
    );
    expect(shouldShowDayContext({ kind: "activity-edit", activityId: "a1" })).toBe(false);
  });

  it("exposes all supported transport types in the product", () => {
    expect(TRANSPORT_TYPES).toEqual([
      "flight",
      "train",
      "bus",
      "ferry",
      "car",
      "taxi",
    ]);
  });

  it("builds transport journey preview from real field values only", () => {
    expect(
      buildTransportJourneyPreview({
        departureLocationName: "Tokyo",
        arrivalLocationName: "Kyoto",
        departureTime: "10:00",
        arrivalTime: "12:15",
      }),
    ).toEqual({
      routeLabel: "Tokyo → Kyoto",
      timeLabel: "10:00 → 12:15",
    });
    expect(buildTransportJourneyPreview({ departureLocationName: "Tokyo" })).toBeNull();
  });
});
