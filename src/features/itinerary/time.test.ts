import { describe, expect, it } from "vitest";
import {
  compareWallClockTimes,
  formatActivityTimeDisplay,
  isValidWallClockTime,
  validateActivityTimes,
} from "./time";

describe("isValidWallClockTime", () => {
  it("accepts HH:mm in 24-hour format", () => {
    expect(isValidWallClockTime("00:00")).toBe(true);
    expect(isValidWallClockTime("09:30")).toBe(true);
    expect(isValidWallClockTime("23:59")).toBe(true);
  });

  it("rejects invalid wall clock values", () => {
    expect(isValidWallClockTime("24:00")).toBe(false);
    expect(isValidWallClockTime("9:30")).toBe(false);
    expect(isValidWallClockTime("09:60")).toBe(false);
    expect(isValidWallClockTime("")).toBe(false);
  });
});

describe("compareWallClockTimes", () => {
  it("orders times lexicographically", () => {
    expect(compareWallClockTimes("09:00", "10:00")).toBeLessThan(0);
    expect(compareWallClockTimes("10:00", "09:00")).toBeGreaterThan(0);
    expect(compareWallClockTimes("10:00", "10:00")).toBe(0);
  });
});

describe("formatActivityTimeDisplay", () => {
  it("returns undefined when startTime is missing", () => {
    expect(formatActivityTimeDisplay(undefined, "10:00")).toBeUndefined();
  });

  it("formats start-only and start-end ranges", () => {
    expect(formatActivityTimeDisplay("09:00")).toBe("09:00");
    expect(formatActivityTimeDisplay("09:00", "11:30")).toBe("09:00–11:30");
  });
});

describe("validateActivityTimes", () => {
  it("requires startTime when endTime is set", () => {
    expect(validateActivityTimes(undefined, "10:00")).toBe(false);
  });

  it("rejects endTime before startTime", () => {
    expect(validateActivityTimes("12:00", "09:00")).toBe(false);
  });

  it("accepts valid same-day ranges", () => {
    expect(validateActivityTimes("09:00", "12:00")).toBe(true);
    expect(validateActivityTimes("09:00", "09:00")).toBe(true);
    expect(validateActivityTimes("09:00")).toBe(true);
  });
});
