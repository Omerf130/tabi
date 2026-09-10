import { describe, expect, it } from "vitest";
import { selectUpcomingHomeReminders } from "./select-upcoming-home-reminders";

describe("selectUpcomingHomeReminders", () => {
  it("returns incomplete reminders on or after today chronologically", () => {
    const selected = selectUpcomingHomeReminders(
      [
        {
          id: "past",
          date: "2026-10-01",
          time: "09:00",
          text: "past",
          isCompleted: false,
        },
        {
          id: "today",
          date: "2026-10-10",
          time: "10:00",
          text: "today",
          isCompleted: false,
        },
        {
          id: "future",
          date: "2026-10-12",
          time: "08:00",
          text: "future",
          isCompleted: false,
        },
        {
          id: "done",
          date: "2026-10-15",
          time: "12:00",
          text: "done",
          isCompleted: true,
        },
      ],
      "2026-10-10",
    );

    expect(selected.map((item) => item.id)).toEqual(["today", "future"]);
  });

  it("limits reminders to three items", () => {
    const selected = selectUpcomingHomeReminders(
      Array.from({ length: 5 }, (_, index) => ({
        id: `r${index}`,
        date: `2026-10-${String(11 + index).padStart(2, "0")}`,
        time: "09:00",
        text: `reminder ${index}`,
        isCompleted: false,
      })),
      "2026-10-10",
    );

    expect(selected).toHaveLength(3);
  });
});
