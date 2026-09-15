import type { AfterTripFinanceRecapViewModel } from "@/features/finance/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
import type { UpcomingHomeReminderItem } from "@/features/trips/reminders/select-upcoming-home-reminders";
import type { TripPhase } from "@/features/trips/trip-phase";
import type { HomeItineraryPreviewItem } from "./build-home-itinerary-preview";
import type { DayOnePreviewItem } from "./build-day-one-home-preview";
import type { AfterTripSummaryMetric } from "./build-after-trip-summary";
import type { HomePreparationViewModel } from "./build-home-preparation";

export type TripHomeCountdownViewModel = {
  targetMs: number;
  referenceMs?: number;
};

export type TripHomeHeroViewModel = {
  tripName: string;
  dateRangeLabel: string;
  heroImageSrc: string;
  hasPersistedCover: boolean;
  tripIdentityLabel?: string;
  durationLabel?: string;
  currentDay?: {
    dayNumber: number;
    totalDays: number;
    weekdayLabel: string;
    dateLabel: string;
  };
  weather?: {
    temperatureLabel: string;
    conditionIconUrl: string;
    conditionLabel: string;
  };
  completionMessage?: string;
};

export type TripHomeItinerarySection = {
  title: string;
  subtitle?: string;
  dayMeta?: string;
  items: HomeItineraryPreviewItem[];
  overflowCount: number;
  isEmpty: boolean;
  emptyMessage: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TripHomeDayOnePreview = {
  weekdayLabel: string;
  dateLabel: string;
  dayMeta: string;
  items: DayOnePreviewItem[];
  overflowCount: number;
  isEmpty: boolean;
  emptyMessage: string;
  photoPresentation: PlacePhotoPresentation;
  dayHref: string;
};

export type TripHomeRemindersManagerData = {
  tripId: string;
  startDate: string;
  endDate: string;
  currentTripDate: string;
  reminders: TripReminderViewModel[];
};

export type TripHomeBeforeJourneyViewModel = {
  preparation: HomePreparationViewModel | null;
  upcomingReminders: UpcomingHomeReminderItem[] | null;
  dayOne: TripHomeDayOnePreview;
  itineraryCta: {
    label: string;
    href: string;
  };
};

export type TripHomeReminderItem = {
  id: string;
  time: string;
  text: string;
};

export type TripHomeImportantToday = {
  reminders: TripHomeReminderItem[];
};

export type TripHomeActivityCard = {
  id: string;
  title: string;
  timeLabel?: string;
  locationName?: string;
  navigationHref?: string;
  photoPresentation: PlacePhotoPresentation;
};

export type TripHomeTonightCard = {
  id: string;
  name: string;
  city?: string;
  stayContext?: string;
  navigationHref?: string;
  photoPresentation: PlacePhotoPresentation;
};

export type TripHomeItineraryRevisit = {
  href: string;
  title: string;
  description: string;
};

export type TripHomeTodaySummary = {
  tonightName?: string;
  weatherLabel?: string;
  weatherIconUrl?: string;
  todayItemCount?: number;
  todayPlanHref?: string;
};

export type TripHomeUpcomingViewModel = {
  phase: "upcoming";
  hero: TripHomeHeroViewModel;
  countdown: TripHomeCountdownViewModel;
  beforeJourney: TripHomeBeforeJourneyViewModel;
  remindersManager: TripHomeRemindersManagerData;
};

export type TripHomeActiveViewModel = {
  phase: "active";
  hero: TripHomeHeroViewModel;
  importantToday: TripHomeImportantToday | null;
  todaysPlan: TripHomeItinerarySection;
  now: TripHomeActivityCard | null;
  upNext: TripHomeActivityCard | null;
  tonight: TripHomeTonightCard | null;
  todaySummary: TripHomeTodaySummary;
  remindersManager: TripHomeRemindersManagerData;
};

export type TripHomeCompletedViewModel = {
  phase: "completed";
  hero: TripHomeHeroViewModel;
  tripSummary: AfterTripSummaryMetric[];
  financeRecap: AfterTripFinanceRecapViewModel;
  itineraryRevisit: TripHomeItineraryRevisit;
};

export type TripHomeViewModel =
  | TripHomeUpcomingViewModel
  | TripHomeActiveViewModel
  | TripHomeCompletedViewModel;

export function isTripHomePhase(
  model: TripHomeViewModel,
  phase: TripPhase,
): boolean {
  return model.phase === phase;
}
