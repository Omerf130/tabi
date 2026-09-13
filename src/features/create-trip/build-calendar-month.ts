import { parseCalendarDateParts } from "@/features/trips/calendar-date";

export type CalendarMonthDay = {
  date: string;
  day: number;
};

export type CalendarMonthGrid = {
  year: number;
  month: number;
  weeks: Array<Array<CalendarMonthDay | null>>;
};

function formatMonthDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function buildCalendarMonthGrid(year: number, month: number): CalendarMonthGrid {
  const firstDayUtc = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = firstDayUtc.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: Array<CalendarMonthDay | null> = [];

  for (let index = 0; index < startWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: formatMonthDate(year, month, day),
      day,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: Array<Array<CalendarMonthDay | null>> = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return { year, month, weeks };
}

export function shiftCalendarMonth(
  year: number,
  month: number,
  delta: -1 | 1,
): { year: number; month: number } {
  if (delta === 1) {
    return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  }
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export function getInitialVisibleMonth(startDate: string, endDate: string): {
  year: number;
  month: number;
} {
  const source = startDate || endDate;
  const parts = parseCalendarDateParts(source);
  if (parts) {
    return { year: parts.year, month: parts.month };
  }

  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}
