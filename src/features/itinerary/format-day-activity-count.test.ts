import { describe, expect, it } from "vitest";
import { formatDayActivityCount } from "./format-day-activity-count";

describe("formatDayActivityCount", () => {
  it("formats zero, one, and many activities in Hebrew", () => {
    expect(formatDayActivityCount(0)).toBe("אין פעילויות");
    expect(formatDayActivityCount(1)).toBe("פעילות אחת");
    expect(formatDayActivityCount(2)).toBe("2 פעילויות");
    expect(formatDayActivityCount(7)).toBe("7 פעילויות");
  });
});
