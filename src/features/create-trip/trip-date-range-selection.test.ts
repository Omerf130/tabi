import { describe, expect, it } from "vitest";
import {
  getCalendarDayVisualState,
  selectTripDateRange,
} from "./trip-date-range-selection";

describe("selectTripDateRange", () => {
  it("selects start then end dates in order", () => {
    expect(selectTripDateRange({ startDate: "", endDate: "" }, "2026-10-24")).toEqual({
      startDate: "2026-10-24",
      endDate: "",
    });
    expect(
      selectTripDateRange(
        { startDate: "2026-10-24", endDate: "" },
        "2026-11-19",
      ),
    ).toEqual({
      startDate: "2026-10-24",
      endDate: "2026-11-19",
    });
  });

  it("supports cross-month ranges without changing canonical date strings", () => {
    const range = selectTripDateRange(
      { startDate: "2026-10-24", endDate: "" },
      "2026-11-19",
    );
    expect(range.startDate).toBe("2026-10-24");
    expect(range.endDate).toBe("2026-11-19");
  });

  it("restarts the range when selecting an earlier second date", () => {
    expect(
      selectTripDateRange(
        { startDate: "2026-10-24", endDate: "" },
        "2026-10-10",
      ),
    ).toEqual({
      startDate: "2026-10-10",
      endDate: "",
    });
  });

  it("rejects ranges longer than the max trip length", () => {
    expect(
      selectTripDateRange(
        { startDate: "2026-01-01", endDate: "" },
        "2026-12-31",
      ),
    ).toEqual({
      startDate: "2026-12-31",
      endDate: "",
    });
  });
});

describe("getCalendarDayVisualState", () => {
  it("marks start, end, and in-between range days", () => {
    expect(
      getCalendarDayVisualState(
        "2026-10-24",
        "2026-10-24",
        "2026-10-28",
        "2026-10-01",
      ),
    ).toBe("range-start");
    expect(
      getCalendarDayVisualState(
        "2026-10-26",
        "2026-10-24",
        "2026-10-28",
        "2026-10-01",
      ),
    ).toBe("range");
    expect(
      getCalendarDayVisualState(
        "2026-10-28",
        "2026-10-24",
        "2026-10-28",
        "2026-10-01",
      ),
    ).toBe("range-end");
  });
});
