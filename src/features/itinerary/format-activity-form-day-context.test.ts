import { describe, expect, it } from "vitest";
import { createHebrewCommonTranslator } from "@/features/i18n/test-translators";
import { formatActivityFormDayContext } from "./format-activity-form-day-context";

describe("formatActivityFormDayContext", () => {
  it("formats day number and date label", () => {
    const t = createHebrewCommonTranslator();
    expect(
      formatActivityFormDayContext("2026-10-25", "2026-11-18", "2026-10-27", t),
    ).toBe("יום 3 · 27/10");
  });
});
