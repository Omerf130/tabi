import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createHebrewHomeTranslations } from "@/features/i18n/test-translators";
import { buildTripHomeViewModel } from "./build-trip-home-view-model";

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "Trip",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf8");
}

describe("trip home ES2 reminders", () => {
  it("view-model exposes null upcoming reminders when none exist", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations: createHebrewHomeTranslations(),
      todayTripLocal: "2026-10-01",
      nowTripLocal: "10:00",
      dayActivities: [],
    });

    expect(model.phase).toBe("upcoming");
    if (model.phase !== "upcoming") {
      return;
    }

    expect(model.beforeJourney.upcomingReminders).toBeNull();
  });

  it("view-model includes reminders when provided", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations: createHebrewHomeTranslations(),
      todayTripLocal: "2026-10-01",
      nowTripLocal: "10:00",
      dayActivities: [],
      upcomingReminders: [
        {
          id: "r1",
          text: "Pack",
          date: "2026-10-20",
          dateLabel: "Oct 20",
          time: "09:00",
        },
      ],
    });

    expect(model.phase).toBe("upcoming");
    if (model.phase !== "upcoming") {
      return;
    }

    expect(model.beforeJourney.upcomingReminders).toHaveLength(1);
  });

  it("BeforeTripJourney renders reminders section only when data exists", () => {
    const source = readSource("features/trip-home/BeforeTripJourney.tsx");

    expect(source).toMatch(/journey\.upcomingReminders\s*\?\s*\(/);
    expect(source).not.toContain("upcomingReminders ?? []");
  });
});
