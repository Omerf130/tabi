import { describe, expect, it } from "vitest";
import { createHebrewHomeTranslations } from "@/features/i18n/test-translators";
import type { TripReminderViewModel } from "./types";
import {
  filterRemindersForTab,
  getReminderManagerEmptyMessage,
  groupRemindersForTab,
} from "./filter-trip-home-reminders";

function reminder(
  overrides: Partial<TripReminderViewModel> & Pick<TripReminderViewModel, "id">,
): TripReminderViewModel {
  return {
    date: "2026-09-13",
    time: "10:00",
    text: "Reminder",
    isCompleted: false,
    dateLabel: "13 בספט׳",
    displayLine: "13 בספט׳ · 10:00",
    ...overrides,
  };
}

describe("filterRemindersForTab", () => {
  const reminders = [
    reminder({ id: "today", date: "2026-09-13", text: "Today" }),
    reminder({ id: "upcoming", date: "2026-09-14", text: "Tomorrow" }),
    reminder({ id: "done", date: "2026-09-12", isCompleted: true, text: "Done" }),
  ];

  it("filters today reminders", () => {
    expect(
      filterRemindersForTab(reminders, "today", "2026-09-13").map((entry) => entry.id),
    ).toEqual(["today"]);
  });

  it("filters upcoming reminders", () => {
    expect(
      filterRemindersForTab(reminders, "upcoming", "2026-09-13").map((entry) => entry.id),
    ).toEqual(["upcoming"]);
  });

  it("filters all incomplete reminders", () => {
    expect(
      filterRemindersForTab(reminders, "all", "2026-09-13").map((entry) => entry.id),
    ).toEqual(["today", "upcoming"]);
  });

  it("filters completed reminders", () => {
    expect(
      filterRemindersForTab(reminders, "completed", "2026-09-13").map((entry) => entry.id),
    ).toEqual(["done"]);
  });
});

describe("groupRemindersForTab", () => {
  it("groups upcoming reminders by date without duplicates", () => {
    const groups = groupRemindersForTab(
      [
        reminder({ id: "a", date: "2026-09-14", text: "A" }),
        reminder({ id: "b", date: "2026-09-14", text: "B" }),
        reminder({ id: "c", date: "2026-09-15", text: "C" }),
      ],
      "upcoming",
      "2026-09-13",
    );

    expect(groups).toHaveLength(2);
    expect(groups[0]?.reminders.map((entry) => entry.id)).toEqual(["a", "b"]);
    expect(groups[1]?.reminders.map((entry) => entry.id)).toEqual(["c"]);
  });
});

describe("getReminderManagerEmptyMessage", () => {
  it("returns tab-specific empty copy", () => {
    const tHome = createHebrewHomeTranslations().tHome;
    expect(getReminderManagerEmptyMessage("today", tHome)).toBe("אין תזכורות להיום");
    expect(getReminderManagerEmptyMessage("completed", tHome)).toBe(
      "עדיין אין תזכורות שהושלמו",
    );
  });
});
