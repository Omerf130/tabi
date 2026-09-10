import { compareCalendarDates } from "@/features/trips/calendar-date";
import { formatReminderDateLabel } from "./format-reminder";
import { compareTripReminders } from "./reminder-domain";

export type UpcomingHomeReminderRecord = {
  id: string;
  date: string;
  time: string;
  text: string;
  isCompleted: boolean;
};

export type UpcomingHomeReminderItem = {
  id: string;
  date: string;
  time: string;
  text: string;
  dateLabel: string;
};

export const UPCOMING_HOME_REMINDERS_LIMIT = 3;

export function selectUpcomingHomeReminders(
  reminders: readonly UpcomingHomeReminderRecord[],
  todayJapan: string,
  limit = UPCOMING_HOME_REMINDERS_LIMIT,
): UpcomingHomeReminderItem[] {
  return reminders
    .filter(
      (reminder) =>
        !reminder.isCompleted &&
        compareCalendarDates(reminder.date, todayJapan) >= 0,
    )
    .sort(compareTripReminders)
    .slice(0, limit)
    .map((reminder) => ({
      id: reminder.id,
      date: reminder.date,
      time: reminder.time,
      text: reminder.text,
      dateLabel: formatReminderDateLabel(reminder.date, todayJapan),
    }));
}
