import { addCalendarDays } from "@/features/trips/calendar-date";

/** Latest allowed checkout (exclusive): the calendar day after the trip's last inclusive day. */
export function getMaxAccommodationCheckOutDate(tripEndDate: string): string {
  return addCalendarDays(tripEndDate, 1);
}
