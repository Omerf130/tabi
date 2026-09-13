import { describe, expect, it } from "vitest";
import {
  calculateCountdownParts,
  resolveTripCountdownReferenceMs,
  resolveTripCountdownTargetMs,
} from "./resolve-trip-countdown";

describe("resolveTripCountdownTargetMs", () => {
  it("resolves UTC calendar midnight for trip start date", () => {
    expect(resolveTripCountdownTargetMs("2026-10-24")).toBe(
      Date.UTC(2026, 9, 24),
    );
  });

  it("does not hardcode any timezone offset literal", () => {
    const target = resolveTripCountdownTargetMs("2026-03-15");
    const date = new Date(target);
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(2);
    expect(date.getUTCDate()).toBe(15);
    expect(date.getUTCHours()).toBe(0);
  });
});

describe("resolveTripCountdownReferenceMs", () => {
  it("returns undefined when preview coordinates are omitted", () => {
    expect(resolveTripCountdownReferenceMs()).toBeUndefined();
    expect(resolveTripCountdownReferenceMs({})).toBeUndefined();
  });

  it("composes preview calendar date and wall clock as UTC instant", () => {
    expect(
      resolveTripCountdownReferenceMs({
        previewCalendarDate: "2026-09-24",
        previewWallClock: "12:00",
      }),
    ).toBe(Date.UTC(2026, 8, 24, 12, 0));
  });
});

describe("calculateCountdownParts", () => {
  it("calculates days hours minutes seconds from real target", () => {
    const target = Date.UTC(2026, 9, 24);
    const now = Date.UTC(2026, 8, 11, 11, 41, 34);
    expect(calculateCountdownParts(target, now)).toEqual({
      days: 42,
      hours: 12,
      minutes: 18,
      seconds: 26,
    });
  });

  it("clamps to zero when elapsed", () => {
    const target = Date.UTC(2026, 9, 24);
    const now = Date.UTC(2026, 9, 24, 1, 0, 0);
    expect(calculateCountdownParts(target, now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("never returns negative values", () => {
    const target = Date.UTC(2026, 9, 24);
    const now = target + 86_400_000;
    const parts = calculateCountdownParts(target, now);
    expect(Object.values(parts).every((value) => value >= 0)).toBe(true);
  });
});
