import { describe, expect, it } from "vitest";
import { createHebrewHomeTranslations } from "@/features/i18n/test-translators";
import { buildAfterTripSummary } from "./build-after-trip-summary";

const tHome = createHebrewHomeTranslations().tHome;

describe("buildAfterTripSummary", () => {
  it("always includes day count", () => {
    expect(
      buildAfterTripSummary(
        {
          startDate: "2026-10-25",
          endDate: "2026-11-18",
          activityCount: 0,
          accommodationCount: 0,
        },
        tHome,
      ),
    ).toEqual([{ id: "days", label: "ימים", value: "25" }]);
  });

  it("includes activities and stays when counts are positive", () => {
    expect(
      buildAfterTripSummary(
        {
          startDate: "2026-10-25",
          endDate: "2026-11-18",
          activityCount: 12,
          accommodationCount: 3,
        },
        tHome,
      ),
    ).toEqual([
      { id: "days", label: "ימים", value: "25" },
      { id: "activities", label: "פעילויות", value: "12" },
      { id: "stays", label: "לינות", value: "3" },
    ]);
  });
});
