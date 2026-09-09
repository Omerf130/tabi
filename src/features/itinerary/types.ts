import type { ItineraryDayItem } from "@/features/transport/merge-itinerary-day-items";
import type { TripDayTemporalState } from "@/features/trips/trip-days";
import type { ActivityType } from "./activity-types";

export type ActivityViewModel = {
  id: string;
  date: string;
  title: string;
  type: ActivityType;
  typeLabel: string;
  order: number;
  startTime?: string;
  endTime?: string;
  timeLabel?: string;
  locationName?: string;
  address?: string;
  notes?: string;
};

export type TripDayViewModel = {
  date: string;
  dayNumber: number;
  weekdayLabel: string;
  dateLabel: string;
  headingLabel: string;
  temporalState: TripDayTemporalState;
  activities: ActivityViewModel[];
  items: ItineraryDayItem[];
};

export type ActivityFormValues = {
  date: string;
  title: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  locationName: string;
  address: string;
  notes: string;
};
