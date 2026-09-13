import { describe, expect, it } from "vitest";
import { createHebrewHomeTranslations } from "@/features/i18n/test-translators";
import { buildTestNoExpensesRecap } from "@/features/finance/after-trip-finance-recap-fixture";
import { NEUTRAL_FALLBACK_VISUAL_SRC } from "@/features/destination-visuals/registry";
import type { ActivityViewModel } from "@/features/itinerary/types";
import { buildTripHomeViewModel } from "./build-trip-home-view-model";
import {
  calculateCountdownParts,
  resolveTripCountdownTargetMs,
} from "./resolve-trip-countdown";

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "יפן 2026",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

const translations = createHebrewHomeTranslations();

function activity(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id">,
): ActivityViewModel {
  return {
    date: "2026-11-01",
    title: "פעילות",
    type: "other",
    typeLabel: "אחר",
    order: 0,
    placeSource: "manual",
    ...overrides,
  };
}

describe("buildTripHomeViewModel", () => {
  it("builds before-trip Day 1 preview and itinerary CTA", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
      usePreviewCountdownReference: true,
      dayActivities: [
        activity({
          id: "d1",
          date: "2026-10-25",
          title: "קיוטו",
          order: 0,
          startTime: "10:00",
        }),
      ],
    });

    expect(model.phase).toBe("upcoming");
    if (model.phase !== "upcoming") {
      return;
    }

    expect(model.countdown.targetMs).toBe(resolveTripCountdownTargetMs(trip.startDate));
    expect(
      calculateCountdownParts(
        model.countdown.targetMs,
        model.countdown.referenceMs!,
      ).days,
    ).toBe(23);
    expect(model.beforeJourney.dayOne.dayMeta).toBe("יום 1 מתוך 25");
    expect(model.beforeJourney.dayOne.items[0]?.title).toBe("קיוטו");
    expect(model.beforeJourney.itineraryCta.href).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary/2026-10-25",
    );
    expect(model.beforeJourney.preparation).toBeNull();
    expect(model.beforeJourney.upcomingReminders).toBeNull();
  });

  it("builds before-trip empty Day 1 state", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
      dayActivities: [],
    });

    expect(model.phase).toBe("upcoming");
    if (model.phase !== "upcoming") {
      return;
    }

    expect(model.beforeJourney.dayOne.isEmpty).toBe(true);
    expect(model.beforeJourney.dayOne.emptyMessage).toBe(
      "היום הראשון עדיין מחכה לתכנון",
    );
  });

  it("includes preparation and upcoming reminders when provided", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
      preparation: {
        totalCount: 12,
        completedCount: 8,
        remainingCount: 4,
        percentage: 67,
        progressLabel: "8 מתוך 12 הושלמו",
        previewItems: [
          {
            id: "i1",
            text: "passport",
            isCompleted: true,
            listType: "before_trip",
          },
        ],
        listTiles: [
          {
            type: "before_trip",
            title: "לפני הטיול",
            completedCount: 8,
            totalCount: 12,
            href: "/app/trips/507f1f77bcf86cd799439011/lists/before-trip",
          },
        ],
        listsHref: "/app/trips/507f1f77bcf86cd799439011/lists",
      },
      upcomingReminders: [
        {
          id: "r1",
          date: "2026-10-20",
          time: "10:00",
          text: "לקנות SIM",
          dateLabel: "20 באוק׳",
        },
      ],
    });

    expect(model.phase).toBe("upcoming");
    if (model.phase !== "upcoming") {
      return;
    }

    expect(model.beforeJourney.preparation?.percentage).toBe(67);
    expect(model.beforeJourney.upcomingReminders).toHaveLength(1);
  });

  it("builds during-trip sections with now and up next cards", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-11-01",
      nowJapanTime: "13:00",
      dayActivities: [
        activity({
          id: "now",
          title: "Nishiki Market",
          order: 0,
          startTime: "12:30",
          endTime: "14:00",
        }),
        activity({
          id: "next",
          title: "Fushimi Inari",
          order: 1,
          startTime: "16:00",
        }),
      ],
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.hero.currentDay?.dayNumber).toBe(8);
    expect(model.todaysPlan.title).toBe("המסלול של היום");
    expect(model.now?.id).toBe("now");
    expect(model.upNext?.id).toBe("next");
    expect(model.todaysPlan.items.some((item) => item.id === "now")).toBe(false);
    expect(model.todaysPlan.items.some((item) => item.id === "next")).toBe(false);
    expect(model.todaysPlan.ctaHref).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary/2026-11-01",
    );
  });

  it("omits important today when there are no reminders", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-11-01",
      nowJapanTime: "10:00",
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.importantToday).toBeNull();
  });

  it("includes remindersManager bundle for upcoming and active phases", () => {
    const upcoming = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
      allReminders: [
        {
          id: "r1",
          date: "2026-10-20",
          time: "10:00",
          text: "SIM",
          isCompleted: false,
          dateLabel: "20 באוק׳",
          displayLine: "20 באוק׳ · 10:00",
        },
      ],
    });

    expect(upcoming.phase).toBe("upcoming");
    if (upcoming.phase === "upcoming") {
      expect(upcoming.remindersManager).toEqual({
        tripId: trip.id,
        startDate: trip.startDate,
        endDate: trip.endDate,
        currentTripDate: "2026-10-01",
        reminders: [
          {
            id: "r1",
            date: "2026-10-20",
            time: "10:00",
            text: "SIM",
            isCompleted: false,
            dateLabel: "20 באוק׳",
            displayLine: "20 באוק׳ · 10:00",
          },
        ],
      });
    }

    const active = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-11-01",
      nowJapanTime: "10:00",
      allReminders: [],
    });

    expect(active.phase).toBe("active");
    if (active.phase === "active") {
      expect(active.remindersManager.currentTripDate).toBe("2026-11-01");
      expect(active.remindersManager.reminders).toEqual([]);
    }
  });

  it("includes today's reminders in important today", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-11-01",
      nowJapanTime: "13:00",
      todayReminders: [
        { id: "r1", time: "14:00", text: "להזמין מונית" },
        { id: "r2", time: "17:30", text: "להתקשר למסעדה" },
      ],
    });

    expect(model.phase).toBe("active");
    if (model.phase !== "active") {
      return;
    }

    expect(model.importantToday?.reminders).toEqual([
      { id: "r1", time: "14:00", text: "להזמין מונית" },
      { id: "r2", time: "17:30", text: "להתקשר למסעדה" },
    ]);
  });

  it("builds after-trip state with finance recap and without highlights", () => {
    const model = buildTripHomeViewModel({
      trip,
      translations,
      todayJapan: "2026-12-01",
      nowJapanTime: "10:00",
      financeRecap: buildTestNoExpensesRecap(),
    });

    expect(model.phase).toBe("completed");
    if (model.phase !== "completed") {
      return;
    }

    expect(model.hero.completionMessage).toBe("הטיול הסתיים");
    expect(model.tripSummary[0]).toEqual({
      id: "days",
      label: "ימים",
      value: "25",
    });
    expect(model.hero.durationLabel).toBe("25 ימים ביפן 2026");
    expect(model.hero.tripIdentityLabel).toBe("יפן 2026");
    expect(model).not.toHaveProperty("memories");
    expect(model.financeRecap.variant).toBe("noExpenses");
    expect(model.itineraryRevisit.href).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary",
    );
    expect(model.itineraryRevisit.title).toBe("המסלול של הטיול");
    expect(model).not.toHaveProperty("highlights");
  });

  it("uses coverVisualKey when no uploaded cover exists", () => {
    const model = buildTripHomeViewModel({
      translations,
      trip: {
        ...trip,
        coverVisualKey: "japan-01",
      },
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
    });

    expect(model.hero.heroImageSrc).not.toBe(NEUTRAL_FALLBACK_VISUAL_SRC);
    expect(model.hero.hasPersistedCover).toBe(false);
  });

  it("uses uploaded cover when present", () => {
    const model = buildTripHomeViewModel({
      translations,
      trip: {
        ...trip,
        coverImage: { pathname: "x", contentType: "image/jpeg" },
        coverVisualKey: "japan-01",
      },
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
    });

    expect(model.hero.heroImageSrc).toBe(
      "/app/trips/507f1f77bcf86cd799439011/cover",
    );
    expect(model.hero.hasPersistedCover).toBe(true);
  });
});
