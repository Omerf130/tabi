import { compareCalendarDates } from "./calendar-date";

export type TripPhase = "upcoming" | "active" | "completed";

export function getTripPhase(
  startDate: string,
  endDate: string,
  todayTripLocal: string,
): TripPhase {
  if (compareCalendarDates(todayTripLocal, startDate) < 0) {
    return "upcoming";
  }
  if (compareCalendarDates(todayTripLocal, endDate) > 0) {
    return "completed";
  }
  return "active";
}
