import type { TripPhase } from "@/features/trips/trip-phase";
import { compareTripReminders } from "./reminder-domain";

export type TripReminderRecord = {
  id: string;
  date: string;
  time: string;
  text: string;
  isCompleted: boolean;
};

export type TodayHomeReminderItem = {
  id: string;
  time: string;
  text: string;
};

export const HOME_REMINDER_EMPTY_MESSAGE = "אין תזכורות חדשות";

export function selectTodayHomeReminders(
  reminders: readonly TripReminderRecord[],
  phase: TripPhase,
  todayJapan: string,
): TodayHomeReminderItem[] {
  if (phase !== "active") {
    return [];
  }

  return reminders
    .filter(
      (reminder) =>
        !reminder.isCompleted && reminder.date === todayJapan,
    )
    .sort(compareTripReminders)
    .map((reminder) => ({
      id: reminder.id,
      time: reminder.time,
      text: reminder.text,
    }));
}
