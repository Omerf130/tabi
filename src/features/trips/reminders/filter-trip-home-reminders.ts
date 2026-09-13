import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { compareCalendarDates } from "@/features/trips/calendar-date";
import { formatTripDayHeading } from "@/features/trips/trip-days";
import { compareTripReminders } from "./compare-trip-reminders";
import type { TripReminderViewModel } from "./types";

export type ReminderManagerTab = "today" | "upcoming" | "all" | "completed";

export type ReminderDateGroup = {
  date: string;
  heading: string;
  reminders: TripReminderViewModel[];
};

export function filterRemindersForTab(
  reminders: readonly TripReminderViewModel[],
  tab: ReminderManagerTab,
  currentTripDate: string,
): TripReminderViewModel[] {
  switch (tab) {
    case "today":
      return reminders.filter(
        (reminder) =>
          !reminder.isCompleted && reminder.date === currentTripDate,
      );
    case "upcoming":
      return reminders.filter(
        (reminder) =>
          !reminder.isCompleted &&
          compareCalendarDates(reminder.date, currentTripDate) > 0,
      );
    case "all":
      return reminders.filter((reminder) => !reminder.isCompleted);
    case "completed":
      return reminders.filter((reminder) => reminder.isCompleted);
  }
}

function compareReminderGroups(
  left: ReminderDateGroup,
  right: ReminderDateGroup,
  tab: ReminderManagerTab,
): number {
  const dateCompare = compareCalendarDates(left.date, right.date);
  if (tab === "completed") {
    return -dateCompare;
  }
  return dateCompare;
}

export function groupRemindersForTab(
  reminders: readonly TripReminderViewModel[],
  tab: ReminderManagerTab,
  currentTripDate: string,
): ReminderDateGroup[] {
  const filtered = filterRemindersForTab(reminders, tab, currentTripDate).sort(
    compareTripReminders,
  );

  const groups = new Map<string, TripReminderViewModel[]>();
  for (const reminder of filtered) {
    const existing = groups.get(reminder.date);
    if (existing) {
      existing.push(reminder);
    } else {
      groups.set(reminder.date, [reminder]);
    }
  }

  return Array.from(groups.entries())
    .map(([date, groupReminders]) => ({
      date,
      heading: formatTripDayHeading(date),
      reminders: groupReminders,
    }))
    .sort((left, right) => compareReminderGroups(left, right, tab));
}

export function getReminderManagerEmptyMessage(
  tab: ReminderManagerTab,
  t: AppTranslator<"Home">,
): string {
  switch (tab) {
    case "today":
      return t("remindersEmptyToday");
    case "upcoming":
      return t("remindersEmptyUpcoming");
    case "all":
      return t("remindersEmptyAll");
    case "completed":
      return t("remindersEmptyCompleted");
  }
}
