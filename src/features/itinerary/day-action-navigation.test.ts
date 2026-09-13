import { describe, expect, it } from "vitest";
import {
  createHebrewCommonTranslator,
  createHebrewItineraryTranslator,
} from "@/features/i18n/test-translators";
import { getDayAddMenuOptions, getDayActionSurfaceTitle } from "./day-action-menu";
import { formatActivityFormDayContext } from "./format-activity-form-day-context";
import {
  canDayActionGoBack,
  getDayActionBackTarget,
  shouldShowDayContext,
} from "./day-action-navigation";

describe("day action navigation", () => {
  it("exposes menu options with ids and descriptions", () => {
    const t = createHebrewItineraryTranslator();
    const options = getDayAddMenuOptions(t);

    expect(options.map((option) => option.id)).toEqual([
      "activity",
      "transport",
      "accommodation",
      "reminder",
      "document",
    ]);
    expect(options.every((option) => option.description.length > 0)).toBe(true);
  });

  it("formats menu title and day context", () => {
    const t = createHebrewItineraryTranslator();
    const tCommon = createHebrewCommonTranslator();

    expect(getDayActionSurfaceTitle({ kind: "menu" }, t)).toBe("הוספה ליום");
    expect(
      formatActivityFormDayContext("2026-10-25", "2026-11-18", "2026-10-27", tCommon),
    ).toBe("יום 3 · 27/10");
  });

  it("supports back navigation from nested surfaces", () => {
    expect(canDayActionGoBack({ kind: "activity-create" })).toBe(true);
    expect(getDayActionBackTarget({ kind: "activity-create" })).toEqual({ kind: "menu" });
    expect(shouldShowDayContext({ kind: "activity-create" })).toBe(true);
  });
});
