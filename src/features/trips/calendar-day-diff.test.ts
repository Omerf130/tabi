import { describe, expect, it } from "vitest";
import { getCalendarDaysUntil } from "./calendar-day-diff";

describe("getCalendarDaysUntil", () => {
  it("counts canonical calendar days until the target date", () => {
    expect(getCalendarDaysUntil("2026-10-24", "2026-10-25")).toBe(1);
    expect(getCalendarDaysUntil("2026-10-01", "2026-11-01")).toBe(31);
  });

  it("returns zero when the target date has passed or is today", () => {
    expect(getCalendarDaysUntil("2026-10-25", "2026-10-25")).toBe(0);
    expect(getCalendarDaysUntil("2026-10-26", "2026-10-25")).toBe(0);
  });
});
