import { describe, expect, it } from "vitest";
import { formatActivityFormDayContext } from "./format-activity-form-day-context";

describe("formatActivityFormDayContext", () => {
  it("formats day number and short date for the activity overlay header", () => {
    expect(
      formatActivityFormDayContext("2026-10-25", "2026-11-18", "2026-10-27"),
    ).toBe("יום 3 · 27/10");
  });
});
