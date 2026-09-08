import { describe, expect, it } from "vitest";
import { getJapanWallClockTime } from "./japan-wall-clock";

describe("getJapanWallClockTime", () => {
  it("returns HH:mm in 24-hour format", () => {
    const value = getJapanWallClockTime(new Date("2026-11-01T03:30:00.000Z"));
    expect(value).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
  });

  it("uses Asia/Tokyo timezone", () => {
    const value = getJapanWallClockTime(new Date("2026-11-01T03:30:00.000Z"));
    expect(value).toBe("12:30");
  });
});
