import { compareCalendarDates, getJapanCalendarDate } from "./calendar-date";

export type TripPhase = "upcoming" | "active" | "completed";

export function getTripPhase(
  startDate: string,
  endDate: string,
  todayJapan = getJapanCalendarDate(),
): TripPhase {
  if (compareCalendarDates(todayJapan, startDate) < 0) {
    return "upcoming";
  }
  if (compareCalendarDates(todayJapan, endDate) > 0) {
    return "completed";
  }
  return "active";
}
