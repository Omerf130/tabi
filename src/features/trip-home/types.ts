import type { AfterTripFinanceRecapViewModel } from "@/features/finance/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { UpcomingHomeReminderItem } from "@/features/trips/reminders/select-upcoming-home-reminders";
import type { TripPhase } from "@/features/trips/trip-phase";
import type { HomeItineraryPreviewItem } from "./build-home-itinerary-preview";
import type { DayOnePreviewItem } from "./build-day-one-home-preview";
import type { HomePreparationViewModel } from "./build-home-preparation";

export type TripHomeHeroViewModel = {
  tripName: string;
  dateRangeLabel: string;
  heroImageSrc: string;
  hasPersistedCover: boolean;
  countdownDays?: number;
  countdownLabel?: string;
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

export type TripHomeBeforeJourneyViewModel = {
  preparation: HomePreparationViewModel | null;
  upcomingReminders: UpcomingHomeReminderItem[] | null;
  remindersSettingsHref: string;
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
  settingsHref: string;
};

export type TripHomeActivityCard = {
  id: string;
  title: string;
  timeLabel?: string;
  locationName?: string;
  googleMapsUrl?: string;
  photoPresentation: PlacePhotoPresentation;
};

export type TripHomeTonightCard = {
  id: string;
  name: string;
  city: string;
  stayContext?: string;
  googleMapsUrl?: string;
  photoPresentation: PlacePhotoPresentation;
};

export type TripHomeMemoriesEntry = {
  href: string;
  title: string;
  description: string;
};

export type TripHomeItineraryRevisit = {
  href: string;
  title: string;
  description: string;
};

export type TripHomeUpcomingViewModel = {
  phase: "upcoming";
  hero: TripHomeHeroViewModel;
  beforeJourney: TripHomeBeforeJourneyViewModel;
};

export type TripHomeActiveViewModel = {
  phase: "active";
  hero: TripHomeHeroViewModel;
  importantToday: TripHomeImportantToday | null;
  todaysPlan: TripHomeItinerarySection;
  now: TripHomeActivityCard | null;
  upNext: TripHomeActivityCard | null;
  tonight: TripHomeTonightCard | null;
};

export type TripHomeCompletedViewModel = {
  phase: "completed";
  hero: TripHomeHeroViewModel;
  memories: TripHomeMemoriesEntry;
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
