import { describe, expect, it } from "vitest";
import {
  buildCalendarMonthGrid,
  getInitialVisibleMonth,
  shiftCalendarMonth,
} from "./build-calendar-month";

describe("buildCalendarMonthGrid", () => {
  it("builds October 2026 with Sunday-first padding", () => {
    const grid = buildCalendarMonthGrid(2026, 10);
    expect(grid.weeks[0]?.[0]).toBeNull();
    expect(grid.weeks[0]?.[4]?.date).toBe("2026-10-01");
    expect(grid.weeks.at(-1)?.find((cell) => cell?.date === "2026-10-31")?.day).toBe(31);
  });

  it("supports cross-month navigation", () => {
    expect(shiftCalendarMonth(2026, 10, 1)).toEqual({ year: 2026, month: 11 });
    expect(shiftCalendarMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });

  it("opens on the selected start month", () => {
    expect(getInitialVisibleMonth("2026-10-24", "")).toEqual({
      year: 2026,
      month: 10,
    });
    expect(getInitialVisibleMonth("", "2026-11-19")).toEqual({
      year: 2026,
      month: 11,
    });
  });
});
