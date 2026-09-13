import { describe, expect, it } from "vitest";
import { createHebrewCommonTranslator } from "@/features/i18n/test-translators";
import { formatDayActivityCount } from "./format-day-activity-count";

describe("formatDayActivityCount", () => {
  it("formats zero, one, and many activities in Hebrew", () => {
    const t = createHebrewCommonTranslator();

    expect(formatDayActivityCount(0, t)).toBe("אין פעילויות");
    expect(formatDayActivityCount(1, t)).toBe("פעילות אחת");
    expect(formatDayActivityCount(2, t)).toBe("2 פעילויות");
    expect(formatDayActivityCount(7, t)).toBe("7 פעילויות");
  });
});
