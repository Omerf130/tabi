import { addCalendarDays, compareCalendarDates } from "./calendar-date";

export function getCalendarDaysUntil(from: string, to: string): number {
  if (compareCalendarDates(from, to) >= 0) {
    return 0;
  }

  let count = 0;
  let cursor = from;

  while (compareCalendarDates(cursor, to) < 0) {
    cursor = addCalendarDays(cursor, 1);
    count += 1;
  }

  return count;
}
