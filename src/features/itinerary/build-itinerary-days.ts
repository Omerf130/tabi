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
import { mergeItineraryDayItems } from "@/features/transport/merge-itinerary-day-items";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import { groupActivitiesByDate } from "./group-activities-by-date";
import type { ActivityViewModel, TripDayViewModel } from "./types";

type BuildItineraryDaysInput = {
  startDate: string;
  endDate: string;
  activities?: readonly ActivityViewModel[];
  transportsByDate?: ReadonlyMap<string, readonly TransportItineraryItemViewModel[]>;
  todayJapan?: string;
};

export function buildItineraryDays({
  startDate,
  endDate,
  activities = [],
  transportsByDate = new Map(),
  todayJapan = getJapanCalendarDate(),
}: BuildItineraryDaysInput): TripDayViewModel[] {
  const dates = getInclusiveDateRange(startDate, endDate);
  const grouped = groupActivitiesByDate(activities);

  return dates.map((date) => {
    const dayActivities = grouped.get(date) ?? [];
    const dayTransports = transportsByDate.get(date) ?? [];
    const items = mergeItineraryDayItems(dayActivities, dayTransports);

    return {
      date,
      dayNumber: getTripDayNumber(startDate, endDate, date)!,
      weekdayLabel: formatTripDayWeekday(date),
      dateLabel: formatTripDayDateLabel(date),
      headingLabel: formatTripDayHeading(date),
      temporalState: getTripDayTemporalState(date, todayJapan),
      activities: dayActivities,
      items,
    };
  });
}

export function buildItineraryDaysForTrip(
  trip: Pick<TripWorkspace, "startDate" | "endDate">,
  activities: readonly ActivityViewModel[] = [],
  transportsByDate: ReadonlyMap<string, readonly TransportItineraryItemViewModel[]> = new Map(),
  todayJapan?: string,
): TripDayViewModel[] {
  return buildItineraryDays({
    startDate: trip.startDate,
    endDate: trip.endDate,
    activities,
    transportsByDate,
    todayJapan,
  });
}
