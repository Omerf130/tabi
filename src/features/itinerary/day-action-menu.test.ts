import { describe, expect, it } from "vitest";
import { getAccommodationsSettingsHref } from "@/features/accommodations/constants";
import { buildTransportNewHref } from "@/features/transport/constants";
import { DAY_ADD_MENU_OPTIONS, getDayActionSurfaceTitle } from "./day-action-menu";
import { isDayActionOpen } from "./day-action-surface.types";

describe("day add menu", () => {
  it("offers activity, transport, document, and reminder only", () => {
    expect(DAY_ADD_MENU_OPTIONS.map((option) => option.id)).toEqual([
      "activity",
      "transport",
      "document",
      "reminder",
    ]);
    expect(DAY_ADD_MENU_OPTIONS.map((option) => option.label)).toEqual([
      "פעילות",
      "תחבורה",
      "מסמך",
      "תזכורת",
    ]);
    expect(DAY_ADD_MENU_OPTIONS.map((option) => option.label)).not.toContain("לינה");
  });

  it("uses the owner menu title", () => {
    expect(getDayActionSurfaceTitle({ kind: "menu" })).toBe("מה תרצה להוסיף?");
  });

  it("tracks open action surface states", () => {
    expect(isDayActionOpen({ kind: "closed" })).toBe(false);
    expect(isDayActionOpen({ kind: "activity-create" })).toBe(true);
    expect(isDayActionOpen({ kind: "transport-create", transportType: "train" })).toBe(
      true,
    );
  });
});

describe("accommodation management links", () => {
  it("uses the canonical trip-wide accommodations management route", () => {
    expect(getAccommodationsSettingsHref("trip-1")).toBe(
      "/app/trips/trip-1/manage/accommodations",
    );
  });
});

describe("standalone transport routes", () => {
  it("keeps the existing transport new route available", () => {
    expect(
      buildTransportNewHref("trip-1", "train", {
        departureDate: "2026-10-26",
        fromDay: "2026-10-26",
      }),
    ).toContain("/app/trips/trip-1/transport/new");
  });
});
