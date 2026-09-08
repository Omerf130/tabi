import { describe, expect, it } from "vitest";
import {
  HOME_REMINDER_EMPTY_MESSAGE,
  selectTodayHomeReminders,
  type TripReminderRecord,
} from "./select-today-home-reminders";

function reminder(
  overrides: Partial<TripReminderRecord> & Pick<TripReminderRecord, "id">,
): TripReminderRecord {
  return {
    date: "2026-11-01",
    time: "14:30",
    text: "תזכורת",
    isCompleted: false,
    ...overrides,
  };
}

describe("selectTodayHomeReminders", () => {
  const todayJapan = "2026-11-01";

  it("returns today's incomplete reminders during an active trip", () => {
    const result = selectTodayHomeReminders(
      [
        reminder({ id: "a", time: "14:00", text: "ראשון" }),
        reminder({
          id: "b",
          date: "2026-11-02",
          time: "09:00",
          text: "מחר",
        }),
        reminder({ id: "c", time: "17:30", text: "שני" }),
      ],
      "active",
      todayJapan,
    );

    expect(result.map((item) => item.id)).toEqual(["a", "c"]);
    expect(result.map((item) => item.time)).toEqual(["14:00", "17:30"]);
  });

  it("includes passed-but-incomplete reminders for today", () => {
    const result = selectTodayHomeReminders(
      [reminder({ id: "passed", time: "08:00", text: "עבר" })],
      "active",
      todayJapan,
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("passed");
  });

  it("excludes completed reminders", () => {
    const result = selectTodayHomeReminders(
      [reminder({ id: "done", isCompleted: true })],
      "active",
      todayJapan,
    );

    expect(result).toEqual([]);
  });

  it("returns no reminders before trip", () => {
    const result = selectTodayHomeReminders(
      [reminder({ id: "day1", date: "2026-10-25", time: "10:00" })],
      "upcoming",
      "2026-10-01",
    );

    expect(result).toEqual([]);
  });

  it("returns no reminders after trip", () => {
    const result = selectTodayHomeReminders(
      [reminder({ id: "old", date: "2026-11-01", time: "10:00" })],
      "completed",
      "2026-12-01",
    );

    expect(result).toEqual([]);
  });

  it("does not surface tomorrow reminders during active trip", () => {
    const result = selectTodayHomeReminders(
      [
        reminder({
          id: "tomorrow",
          date: "2026-11-02",
          time: "09:00",
          text: "מחר",
        }),
      ],
      "active",
      todayJapan,
    );

    expect(result).toEqual([]);
  });

  it("exports the Home empty message", () => {
    expect(HOME_REMINDER_EMPTY_MESSAGE).toBe("אין תזכורות חדשות");
  });
});
