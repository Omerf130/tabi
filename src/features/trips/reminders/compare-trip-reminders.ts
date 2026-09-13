import { compareCalendarDates } from "@/features/trips/calendar-date";

export function compareTripReminders<
  T extends { date: string; time: string; id: string },
>(a: T, b: T): number {
  const byDate = compareCalendarDates(a.date, b.date);
  if (byDate !== 0) {
    return byDate;
  }

  if (a.time !== b.time) {
    return a.time < b.time ? -1 : 1;
  }

  return a.id.localeCompare(b.id);
}
