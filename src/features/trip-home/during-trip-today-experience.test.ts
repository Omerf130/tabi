import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { createHebrewHomeTranslations } from "@/features/i18n/test-translators";
import type { ActivityViewModel } from "@/features/itinerary/types";
import { buildLaterTodayPreview } from "./build-home-itinerary-preview";
import { buildTripHomeViewModel } from "./build-trip-home-view-model";
import { DURING_SURFACE_SECTION_ORDER } from "./DuringTripJourney";
import { resolveNowAndNextUp } from "./resolve-now-and-next-up";

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "Sample Trip",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

const heTranslations = createHebrewHomeTranslations();
const enTHome = createAppTranslator("Home", "en");

function activity(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id">,
): ActivityViewModel {
  return {
    date: "2026-11-01",
    title: "Activity",
    type: "other",
    typeLabel: "Other",
    order: 0,
    placeSource: "manual",
    ...overrides,
  };
}

describe("during trip today experience", () => {
  it("orders surface sections vertically without carousel slot", () => {
    expect(DURING_SURFACE_SECTION_ORDER).toEqual([
      "importantToday",
      "now",
      "upNext",
      "laterToday",
      "todaySummary",
      "fullDayItinerary",
    ]);
  });

  it("distributes NOW, NEXT, and LATER without duplicates at 10:30", () => {
    const dayActivities = [
      activity({
        id: "a",
        title: "Activity A",
        order: 0,
        startTime: "10:00",
        endTime: "12:00",
      }),
      activity({
        id: "b",
        title: "Activity B",
        order: 1,
        startTime: "13:00",
        endTime: "14:00",
      }),
      activity({
        id: "c",
        title: "Activity C",
        order: 2,
        startTime: "17:00",
        endTime: "18:00",
      }),
      activity({
        id: "d",
        title: "Activity D",
        order: 3,
        startTime: "20:00",
        endTime: "21:00",
      }),
    ];

    const model = buildTripHomeViewModel({
      trip,
      translations: heTranslations,
      todayTripLocal: "2026-11-01",
      nowTripLocal: "10:30",
      dayActivities,
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.now?.id).toBe("a");
    expect(model.upNext?.id).toBe("b");
    expect(model.laterToday.map((item) => item.id)).toEqual(["c", "d"]);
    expect(model.laterToday.some((item) => item.id === "b")).toBe(false);
  });

  it("hides NOW and keeps NEXT + LATER at 15:00", () => {
    const dayActivities = [
      activity({
        id: "a",
        title: "Activity A",
        order: 0,
        startTime: "10:00",
        endTime: "12:00",
      }),
      activity({
        id: "b",
        title: "Activity B",
        order: 1,
        startTime: "13:00",
        endTime: "14:00",
      }),
      activity({
        id: "c",
        title: "Activity C",
        order: 2,
        startTime: "17:00",
        endTime: "18:00",
      }),
      activity({
        id: "d",
        title: "Activity D",
        order: 3,
        startTime: "20:00",
        endTime: "21:00",
      }),
    ];

    const model = buildTripHomeViewModel({
      trip,
      translations: heTranslations,
      todayTripLocal: "2026-11-01",
      nowTripLocal: "15:00",
      dayActivities,
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.now).toBeNull();
    expect(model.upNext?.id).toBe("c");
    expect(model.laterToday.map((item) => item.id)).toEqual(["d"]);
  });

  it("hides NOW, NEXT, and LATER when the day is finished", () => {
    const dayActivities = [
      activity({
        id: "a",
        title: "Activity A",
        order: 0,
        startTime: "10:00",
        endTime: "12:00",
      }),
      activity({
        id: "b",
        title: "Activity B",
        order: 1,
        startTime: "13:00",
        endTime: "14:00",
      }),
    ];

    const model = buildTripHomeViewModel({
      trip,
      translations: heTranslations,
      todayTripLocal: "2026-11-01",
      nowTripLocal: "22:00",
      dayActivities,
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.now).toBeNull();
    expect(model.upNext).toBeNull();
    expect(model.laterToday).toHaveLength(0);
  });

  it("shows only NEXT when it is the sole future timed activity", () => {
    const dayActivities = [
      activity({
        id: "only",
        title: "Only future",
        order: 0,
        startTime: "18:00",
        endTime: "19:00",
      }),
    ];

    const model = buildTripHomeViewModel({
      trip,
      translations: heTranslations,
      todayTripLocal: "2026-11-01",
      nowTripLocal: "10:00",
      dayActivities,
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.now).toBeNull();
    expect(model.upNext?.id).toBe("only");
    expect(model.laterToday).toHaveLength(0);
  });

  it("counts all scheduled activities in summary, not only NOW/NEXT", () => {
    const dayActivities = [
      activity({ id: "1", order: 0, startTime: "09:00", endTime: "10:00" }),
      activity({ id: "2", order: 1, startTime: "11:00", endTime: "12:00" }),
      activity({ id: "3", order: 2, startTime: "14:00", endTime: "15:00" }),
    ];

    const model = buildTripHomeViewModel({
      trip,
      translations: heTranslations,
      todayTripLocal: "2026-11-01",
      nowTripLocal: "11:30",
      dayActivities,
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.todaySummary.activityCount).toBe(3);
  });

  it("omits important today when there are no reminders", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations: heTranslations,
      todayTripLocal: "2026-11-01",
      nowTripLocal: "10:00",
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.importantToday).toBeNull();
  });

  it("exposes Hebrew reminder section copy", () => {
    expect(heTranslations.tHome("todayRemindersTitle")).toBe("תזכורות להיום");
    expect(heTranslations.tHome("laterTodayTitle")).toBe("בהמשך היום");
  });

  it("exposes English reminder section copy", () => {
    expect(enTHome("todayRemindersTitle")).toBe("Today's reminders");
    expect(enTHome("laterTodayTitle")).toBe("Later today");
  });

  it("uses trip-local wall clock in resolveNowAndNextUp", () => {
    const { nowActivity, nextActivity } = resolveNowAndNextUp(
      [
        activity({
          id: "now",
          startTime: "12:00",
          endTime: "13:00",
        }),
        activity({
          id: "next",
          startTime: "15:00",
          endTime: "16:00",
        }),
      ],
      "12:30",
    );

    expect(nowActivity?.id).toBe("now");
    expect(nextActivity?.id).toBe("next");
  });

  it("buildLaterTodayPreview excludes NOW and NEXT ids", () => {
    const dayActivities = [
      activity({ id: "now", startTime: "10:00", endTime: "12:00", order: 0 }),
      activity({ id: "next", startTime: "13:00", endTime: "14:00", order: 1 }),
      activity({ id: "later", startTime: "18:00", endTime: "19:00", order: 2 }),
    ];
    const exclude = new Set(["now", "next"]);
    const later = buildLaterTodayPreview(
      dayActivities,
      [],
      "10:30",
      exclude,
      trip.id,
    );
    expect(later.map((item) => item.id)).toEqual(["later"]);
  });

  it("does not introduce horizontal carousel or scroll-snap in during-trip UI", () => {
    const scss = readFileSync(
      join(process.cwd(), "src/features/trip-home/TripHomeContent.module.scss"),
      "utf8",
    );
    const journey = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTripJourney.tsx"),
      "utf8",
    );
    const summary = readFileSync(
      join(process.cwd(), "src/features/trip-home/DuringTodaySummary.tsx"),
      "utf8",
    );

    expect(journey).not.toContain("TodaysPlanSection");
    expect(journey).not.toContain("TripHomeRemindersEntry");
    expect(summary).toContain("duringSummaryGrid");
    expect(scss).not.toMatch(/duringSummaryGrid[\s\S]*overflow-x:\s*auto/);
    expect(scss).not.toMatch(/scroll-snap-type:\s*x/);
    expect(journey).not.toMatch(/carousel|swiper|scroll-snap/i);
  });

  it("keeps before-trip and after-trip journey files unchanged in structure", () => {
    const before = readFileSync(
      join(process.cwd(), "src/features/trip-home/BeforeTripJourney.tsx"),
      "utf8",
    );
    const after = readFileSync(
      join(process.cwd(), "src/features/trip-home/AfterTripJourney.tsx"),
      "utf8",
    );

    expect(before).toContain("BeforeTripJourney");
    expect(after).toContain("AfterTripJourney");
    expect(before).not.toContain("LaterTodaySection");
    expect(after).not.toContain("LaterTodaySection");
  });
});
