import { describe, expect, it } from "vitest";
import {
  addCalendarDays,
  compareCalendarDates,
  formatCalendarDateDisplay,
  getJapanCalendarDate,
  isValidCalendarDateString,
  normalizeCalendarDateInput,
} from "./calendar-date";

describe("isValidCalendarDateString", () => {
  it("accepts canonical zero-padded dates", () => {
    expect(isValidCalendarDateString("2026-10-25")).toBe(true);
    expect(normalizeCalendarDateInput("2026-10-25")).toBe("2026-10-25");
  });

  it("accepts valid leap day", () => {
    expect(isValidCalendarDateString("2024-02-29")).toBe(true);
  });

  it("rejects invalid leap day", () => {
    expect(isValidCalendarDateString("2023-02-29")).toBe(false);
  });

  it("rejects impossible dates", () => {
    expect(isValidCalendarDateString("2026-02-30")).toBe(false);
    expect(isValidCalendarDateString("2026-13-01")).toBe(false);
  });

  it("rejects malformed or non-zero-padded values", () => {
    expect(isValidCalendarDateString("2026-2-5")).toBe(false);
    expect(isValidCalendarDateString("26-10-25")).toBe(false);
    expect(isValidCalendarDateString("2026/10/25")).toBe(false);
  });
});

describe("compareCalendarDates", () => {
  it("sorts canonical YYYY-MM-DD lexicographically", () => {
    expect(compareCalendarDates("2026-10-25", "2026-11-18")).toBeLessThan(0);
    expect(compareCalendarDates("2026-11-18", "2026-10-25")).toBeGreaterThan(0);
    expect(compareCalendarDates("2026-10-25", "2026-10-25")).toBe(0);
  });
});

describe("addCalendarDays", () => {
  it("increments within the same month", () => {
    expect(addCalendarDays("2026-10-25", 1)).toBe("2026-10-26");
  });

  it("crosses month boundary", () => {
    expect(addCalendarDays("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("crosses year boundary", () => {
    expect(addCalendarDays("2025-12-31", 1)).toBe("2026-01-01");
  });

  it("handles leap day", () => {
    expect(addCalendarDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addCalendarDays("2024-02-29", 1)).toBe("2024-03-01");
  });

  it("supports negative delta", () => {
    expect(addCalendarDays("2026-11-01", -1)).toBe("2026-10-31");
  });

  it("throws for invalid date", () => {
    expect(() => addCalendarDays("2026-02-30", 1)).toThrow();
  });
});

describe("formatCalendarDateDisplay", () => {
  it("does not shift the stored calendar day", () => {
    const formatted = formatCalendarDateDisplay("2026-10-25", "en-US");
    expect(formatted).toContain("25");
    expect(formatted).toContain("2026");
  });
});

describe("getJapanCalendarDate", () => {
  it("returns YYYY-MM-DD", () => {
    const value = getJapanCalendarDate(new Date("2026-10-25T15:00:00.000Z"));
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
