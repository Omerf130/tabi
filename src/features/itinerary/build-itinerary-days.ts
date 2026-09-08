import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import type { TripWorkspace } from "@/features/trips/public-trip";
import {
  formatTripDayDateLabel,
  formatTripDayHeading,
  formatTripDayWeekday,
  getInclusiveDateRange,
  getTripDayNumber,
  getTripDayTemporalState,
} from "@/features/trips/trip-days";
import { groupActivitiesByDate } from "./group-activities-by-date";
import type { ActivityViewModel, TripDayViewModel } from "./types";

type BuildItineraryDaysInput = {
  startDate: string;
  endDate: string;
  activities?: readonly ActivityViewModel[];
  todayJapan?: string;
};

export function buildItineraryDays({
  startDate,
  endDate,
  activities = [],
  todayJapan = getJapanCalendarDate(),
}: BuildItineraryDaysInput): TripDayViewModel[] {
  const dates = getInclusiveDateRange(startDate, endDate);
  const grouped = groupActivitiesByDate(activities);

  return dates.map((date) => ({
    date,
    dayNumber: getTripDayNumber(startDate, endDate, date)!,
    weekdayLabel: formatTripDayWeekday(date),
    dateLabel: formatTripDayDateLabel(date),
    headingLabel: formatTripDayHeading(date),
    temporalState: getTripDayTemporalState(date, todayJapan),
    activities: grouped.get(date) ?? [],
  }));
}

export function buildItineraryDaysForTrip(
  trip: Pick<TripWorkspace, "startDate" | "endDate">,
  activities: readonly ActivityViewModel[] = [],
  todayJapan?: string,
): TripDayViewModel[] {
  return buildItineraryDays({
    startDate: trip.startDate,
    endDate: trip.endDate,
    activities,
    todayJapan,
  });
}
