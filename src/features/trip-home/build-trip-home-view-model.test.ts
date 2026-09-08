import { describe, expect, it } from "vitest";
import { buildTripHomeViewModel } from "./build-trip-home-view-model";
import type { ActivityViewModel } from "@/features/itinerary/types";

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "יפן 2026",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
};

function activity(
  overrides: Partial<ActivityViewModel> & Pick<ActivityViewModel, "id">,
): ActivityViewModel {
  return {
    date: "2026-11-01",
    title: "פעילות",
    type: "other",
    typeLabel: "אחר",
    order: 0,
    ...overrides,
  };
}

describe("buildTripHomeViewModel", () => {
  it("builds before-trip Day 1 preview and start-date CTA", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
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
    expect(model.countdownDays).toBe(24);
    expect(model.dailyItinerary?.title).toBe("היום הראשון");
    expect(model.dailyItinerary?.dayMeta).toBe("יום 1 מתוך 25");
    expect(model.dailyItinerary?.items[0]?.title).toBe("קיוטו");
    expect(model.dailyItinerary?.ctaHref).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary?date=2026-10-25",
    );
    expect(model.dailyItinerary?.ctaLabel).toBe("למסלול המלא");
    expect(model.reminderStrip.reminders).toEqual([]);
    expect(model.reminderStrip.emptyMessage).toBe("אין תזכורות חדשות");
  });

  it("builds before-trip empty Day 1 state", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
      dayActivities: [],
    });

    expect(model.dailyItinerary?.isEmpty).toBe(true);
    expect(model.dailyItinerary?.emptyMessage).toBe(
      "היום הראשון עדיין מחכה לתכנון",
    );
  });

  it("builds during-trip daily summary with Now and Next Up", () => {
    const model = buildTripHomeViewModel({
      trip,
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
    expect(model.currentDay?.dayNumber).toBe(8);
    expect(model.dailyItinerary?.title).toBe("המסלול של היום");
    expect(model.dailyItinerary?.items.find((item) => item.id === "now")?.emphasis).toBe(
      "now",
    );
    expect(model.dailyItinerary?.items.find((item) => item.id === "next")?.emphasis).toBe(
      "next",
    );
    expect(model.dailyItinerary?.ctaHref).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary?date=2026-11-01",
    );
    expect(model.dailyItinerary?.ctaLabel).toBe("למסלול המלא של היום");
  });

  it("marks an active empty day in the daily itinerary section", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "10:00",
      dayActivities: [],
    });

    expect(model.dailyItinerary?.isEmpty).toBe(true);
    expect(model.dailyItinerary?.emptyMessage).toBe("היום עדיין פנוי");
    expect(model.dailyItinerary?.ctaLabel).toBe("למסלול של היום");
  });

  it("includes untimed activities in the active daily preview", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "10:00",
      dayActivities: [
        activity({ id: "u1", title: "זמן חופשי", order: 0 }),
        activity({ id: "u2", title: "קניות", order: 1 }),
        activity({ id: "u3", title: "טיול", order: 2 }),
      ],
    });

    expect(model.dailyItinerary?.items.map((item) => item.title)).toEqual([
      "זמן חופשי",
      "קניות",
      "טיול",
    ]);
    expect(model.dailyItinerary?.items.every((item) => item.isUntimed)).toBe(true);
    expect(model.dailyItinerary?.overflowCount).toBe(0);
  });

  it("builds after-trip state without a daily itinerary preview", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-12-01",
      nowJapanTime: "10:00",
    });

    expect(model.phase).toBe("completed");
    expect(model.statusLine).toBe("הטיול הסתיים");
    expect(model.dailyItinerary).toBeUndefined();
    expect(model.itineraryHref).toBe(
      "/app/trips/507f1f77bcf86cd799439011/itinerary",
    );
  });

  it("includes today's reminders in the reminder strip", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-11-01",
      nowJapanTime: "13:00",
      todayReminders: [
        { id: "r1", time: "14:00", text: "להזמין מונית" },
        { id: "r2", time: "17:30", text: "להתקשר למסעדה" },
      ],
    });

    expect(model.reminderStrip.reminders).toEqual([
      { id: "r1", time: "14:00", text: "להזמין מונית" },
      { id: "r2", time: "17:30", text: "להתקשר למסעדה" },
    ]);
    expect(model.reminderStrip.settingsHref).toBe(
      "/app/trips/507f1f77bcf86cd799439011/settings#reminders",
    );
  });

  it("includes cover href when provided", () => {
    const model = buildTripHomeViewModel({
      trip,
      coverImageHref: "/app/trips/507f1f77bcf86cd799439011/cover",
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
    });

    expect(model.coverImageHref).toBe(
      "/app/trips/507f1f77bcf86cd799439011/cover",
    );
  });

  it("omits cover href when not provided", () => {
    const model = buildTripHomeViewModel({
      trip,
      todayJapan: "2026-10-01",
      nowJapanTime: "10:00",
    });

    expect(model.coverImageHref).toBeUndefined();
  });
});
