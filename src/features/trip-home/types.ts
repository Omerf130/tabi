import type { TripPhase } from "@/features/trips/trip-phase";

export type ItineraryPreviewEmphasis = "now" | "next";

export type DailyItineraryPreviewItem = {
  id: string;
  title: string;
  displayTime?: string;
  isUntimed: boolean;
  emphasis?: ItineraryPreviewEmphasis;
  locationName?: string;
};

export type DailyItinerarySummary = {
  title: string;
  subtitle?: string;
  dayMeta?: string;
  items: DailyItineraryPreviewItem[];
  overflowCount: number;
  isEmpty: boolean;
  emptyMessage?: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TripHomeReminderItem = {
  id: string;
  time: string;
  text: string;
};

export type TripHomeReminderStrip = {
  reminders: TripHomeReminderItem[];
  settingsHref: string;
  emptyMessage: string;
};

export type TripHomeViewModel = {
  phase: TripPhase;
  tripName: string;
  dateRangeLabel: string;
  totalDays: number;
  coverImageHref?: string;
  itineraryHref: string;
  primaryCtaLabel: string;
  countdownDays?: number;
  countdownLabel?: string;
  currentDay?: {
    date: string;
    dayNumber: number;
    totalDays: number;
    weekdayLabel: string;
    dateLabel: string;
    headingLabel: string;
  };
  reminderStrip: TripHomeReminderStrip;
  dailyItinerary?: DailyItinerarySummary;
  statusLine?: string;
  closingLine?: string;
};
