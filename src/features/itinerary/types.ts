import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { ResolvedTravelDocumentViewModel } from "@/features/documents/types";
import type { ItineraryDayItem } from "@/features/transport/merge-itinerary-day-items";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import type { TripDayTemporalState } from "@/features/trips/trip-days";
import type { ActivityType } from "./activity-types";
import type { ActivityPlaceSource } from "./activity-place-types";

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
  placeSource: ActivityPlaceSource;
  googlePlaceId?: string;
  locationName?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
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
  placeSource: ActivityPlaceSource;
  googlePlaceId: string;
  locationName: string;
  address: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  googleMapsUrl: string;
  notes: string;
};

export type DaySummaryViewModel = {
  date: string;
  dayNumber: number;
  weekdayLabel: string;
  dateLabel: string;
  temporalState: TripDayTemporalState;
  href: string;
  accommodationLabel?: string;
  activityCount: number;
  transportCount: number;
  documentCount: number;
  hasIncompleteReminder: boolean;
  activityPreview?: string;
  transportPreview?: string;
};

export type FocusedDayWeatherViewModel = {
  temperatureLabel: string;
  conditionIconUrl: string;
  conditionLabel: string;
  locationLabel: string;
};

export type FocusedDayNextItemViewModel = {
  timeLabel?: string;
  title: string;
};

export type FocusedDayCardViewModel = {
  date: string;
  dayNumber: number;
  weekdayLabel: string;
  dateLabel: string;
  temporalState: TripDayTemporalState;
  href: string;
  showTodayBadge: boolean;
  weather?: FocusedDayWeatherViewModel;
  accommodationName?: string;
  nextItems: FocusedDayNextItemViewModel[];
  transportCount: number;
  incompleteReminderCount: number;
};

export type DayWorkspaceViewModel = {
  date: string;
  dayNumber: number;
  weekdayLabel: string;
  dateLabel: string;
  headingLabel: string;
  temporalState: TripDayTemporalState;
  previousDate: string | null;
  nextDate: string | null;
  overviewHref: string;
  accommodations: AccommodationViewModel[];
  items: ItineraryDayItem[];
  activities: ActivityViewModel[];
  transports: TransportItineraryItemViewModel[];
  documents: ResolvedTravelDocumentViewModel[];
  incompleteReminders: TripReminderViewModel[];
  completedReminders: TripReminderViewModel[];
  tripDates: string[];
  isOwner: boolean;
};
