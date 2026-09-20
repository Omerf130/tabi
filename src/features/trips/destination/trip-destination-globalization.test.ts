import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getTripPhase } from "@/features/trips/trip-phase";
import { getCalendarDateInTimeZone } from "./trip-local-calendar";

const projectRoot = process.cwd();

describe("trip destination globalization G1", () => {
  it("does not keep TRIP_CALENDAR_TIMEZONE or Japan calendar helpers in production trips code", () => {
    const constants = readFileSync(
      join(projectRoot, "src/features/trips/constants.ts"),
      "utf8",
    );
    expect(constants).not.toContain("TRIP_CALENDAR_TIMEZONE");

    expect(() =>
      readFileSync(join(projectRoot, "src/features/trips/japan-wall-clock.ts"), "utf8"),
    ).toThrow();
  });

  it("computes trip phase from destination-local today for multiple zones", () => {
    const startDate = "2026-03-20";
    const endDate = "2026-03-25";
    const instant = new Date("2026-03-21T23:30:00.000Z");

    const matrix = [
      { zone: "Asia/Tokyo", today: getCalendarDateInTimeZone("Asia/Tokyo", instant) },
      { zone: "Europe/Rome", today: getCalendarDateInTimeZone("Europe/Rome", instant) },
      { zone: "Asia/Bangkok", today: getCalendarDateInTimeZone("Asia/Bangkok", instant) },
      {
        zone: "America/New_York",
        today: getCalendarDateInTimeZone("America/New_York", instant),
      },
    ];

    expect(new Set(matrix.map((row) => row.today)).size).toBeGreaterThan(1);

    for (const row of matrix) {
      expect(getTripPhase(startDate, endDate, row.today)).toBe("active");
    }
  });
});
