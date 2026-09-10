import type { AccommodationViewModel } from "@/features/accommodations/types";
import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import type { ActivityViewModel } from "@/features/itinerary/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import {
  formatCalendarDateRangeDisplay,
  getJapanCalendarDate,
} from "@/features/trips/calendar-date";
import { getCalendarDaysUntil } from "@/features/trips/calendar-day-diff";
import { getJapanWallClockTime } from "@/features/trips/japan-wall-clock";
import { getTripRemindersSettingsHref } from "@/features/trips/reminders/constants";
import type { UpcomingHomeReminderItem } from "@/features/trips/reminders/select-upcoming-home-reminders";
import type { TodayHomeReminderItem } from "@/features/trips/reminders/select-today-home-reminders";
import { getTripPhase } from "@/features/trips/trip-phase";
import {
  formatTripDayDateLabel,
  formatTripDayWeekday,
  getTripDayCount,
  getTripDayNumber,
} from "@/features/trips/trip-days";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import {
  buildAfterTripDurationLabel,
  resolveAfterTripIdentityLabel,
} from "./build-after-trip-hero";
import { buildDayOneHomePreview } from "./build-day-one-home-preview";
import {
  buildActiveHomeItineraryPreview,
} from "./build-home-itinerary-preview";
import type { HomePreparationViewModel } from "./build-home-preparation";
import { resolveNowAndNextUp } from "./resolve-now-and-next-up";
import type { AfterTripFinanceRecapViewModel } from "@/features/finance/types";
import type {
  TripHomeActiveViewModel,
  TripHomeBeforeJourneyViewModel,
  TripHomeCompletedViewModel,
  TripHomeDayOnePreview,
  TripHomeHeroViewModel,
  TripHomeItinerarySection,
  TripHomeUpcomingViewModel,
  TripHomeViewModel,
} from "./types";

const EMPTY_PHOTO: PlacePhotoPresentation = {
  hasPhoto: false,
  authorAttributions: [],
};

type BuildTripHomeViewModelInput = {
  trip: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    coverImage?: unknown;
    coverVisualKey?: string | null;
    destination?: {
      displayName: string;
      country?: string;
    };
  };
  dayActivities?: readonly ActivityViewModel[];
  dayTransports?: readonly TransportItineraryItemViewModel[];
  todayReminders?: readonly TodayHomeReminderItem[];
  upcomingReminders?: readonly UpcomingHomeReminderItem[];
  preparation?: HomePreparationViewModel | null;
  dayOnePhotoPresentation?: PlacePhotoPresentation;
  accommodations?: readonly AccommodationViewModel[];
  tonightAccommodation?: AccommodationViewModel | null;
  nowPhotoPresentation?: PlacePhotoPresentation;
  upNextPhotoPresentation?: PlacePhotoPresentation;
  tonightPhotoPresentation?: PlacePhotoPresentation;
  weather?: TripHomeHeroViewModel["weather"];
  todayJapan?: string;
  nowJapanTime?: string;
  financeRecap?: AfterTripFinanceRecapViewModel;
};

function formatCountdownLabel(daysUntilStart: number): string {
  if (daysUntilStart === 0) {
    return "היום מתחילים";
  }
  if (daysUntilStart === 1) {
    return "עוד יום אחד";
  }
  return `עוד ${daysUntilStart} ימים`;
}

function buildHeroBase(
  input: BuildTripHomeViewModelInput,
): TripHomeHeroViewModel {
  const { trip } = input;
  const visual = resolveTripVisualSrc({
    tripId: trip.id,
    hasCoverImage: Boolean(trip.coverImage),
    coverVisualKey: trip.coverVisualKey,
  });

  return {
    tripName: trip.name,
    dateRangeLabel: formatCalendarDateRangeDisplay(
      trip.startDate,
      trip.endDate,
    ),
    heroImageSrc: visual.imageSrc,
    hasPersistedCover: visual.hasPersistedCover,
  };
}

function buildDayOnePreviewSection(
  tripId: string,
  startDate: string,
  totalDays: number,
  preview: ReturnType<typeof buildDayOneHomePreview>,
  photoPresentation: PlacePhotoPresentation,
): TripHomeDayOnePreview {
  return {
    weekdayLabel: formatTripDayWeekday(startDate),
    dateLabel: formatTripDayDateLabel(startDate),
    dayMeta: `יום 1 מתוך ${totalDays}`,
    items: preview.items,
    overflowCount: preview.overflowCount,
    isEmpty: preview.isEmpty,
    emptyMessage: "היום הראשון עדיין מחכה לתכנון",
    photoPresentation,
    dayHref: `/app/trips/${tripId}/itinerary/${startDate}`,
  };
}

function buildBeforeJourney(
  input: BuildTripHomeViewModelInput,
  totalDays: number,
): TripHomeBeforeJourneyViewModel {
  const {
    trip,
    dayActivities = [],
    dayTransports = [],
    upcomingReminders = [],
    preparation = null,
    dayOnePhotoPresentation = EMPTY_PHOTO,
    accommodations = [],
  } = input;

  const dayOnePreview = buildDayOneHomePreview(
    trip.startDate,
    dayActivities,
    dayTransports,
    accommodations,
  );
  const itineraryHref = `/app/trips/${trip.id}/itinerary/${trip.startDate}`;

  return {
    preparation,
    upcomingReminders:
      upcomingReminders.length > 0 ? [...upcomingReminders] : null,
    remindersSettingsHref: getTripRemindersSettingsHref(trip.id),
    dayOne: buildDayOnePreviewSection(
      trip.id,
      trip.startDate,
      totalDays,
      dayOnePreview,
      dayOnePhotoPresentation,
    ),
    itineraryCta: {
      label: "למסלול המלא",
      href: itineraryHref,
    },
  };
}

function buildTodaysPlanSection(
  tripId: string,
  todayJapan: string,
  dayNumber: number,
  totalDays: number,
  preview: ReturnType<typeof buildActiveHomeItineraryPreview>,
): TripHomeItinerarySection {
  const itineraryHref = `/app/trips/${tripId}/itinerary/${todayJapan}`;

  return {
    title: "המסלול של היום",
    subtitle: `${formatTripDayWeekday(todayJapan)} · ${formatTripDayDateLabel(todayJapan)}`,
    dayMeta: `יום ${dayNumber} מתוך ${totalDays}`,
    items: preview.items,
    overflowCount: preview.overflowCount,
    isEmpty: preview.isEmpty,
    emptyMessage: "היום עדיין פנוי",
    ctaLabel: preview.isEmpty ? "למסלול של היום" : "למסלול המלא של היום",
    ctaHref: itineraryHref,
  };
}

function toActivityCard(
  activity: ActivityViewModel,
  photoPresentation: PlacePhotoPresentation,
): TripHomeActiveViewModel["now"] {
  return {
    id: activity.id,
    title: activity.title,
    timeLabel: activity.startTime
      ? activity.endTime
        ? `${activity.startTime}–${activity.endTime}`
        : activity.startTime
      : undefined,
    locationName: activity.locationName,
    googleMapsUrl: activity.googleMapsUrl,
    photoPresentation,
  };
}

export function buildTripHomeViewModel(
  input: BuildTripHomeViewModelInput,
): TripHomeViewModel {
  const {
    trip,
    dayActivities = [],
    dayTransports = [],
    todayReminders = [],
    preparation = null,
    dayOnePhotoPresentation = EMPTY_PHOTO,
    tonightAccommodation = null,
    nowPhotoPresentation = EMPTY_PHOTO,
    upNextPhotoPresentation = EMPTY_PHOTO,
    tonightPhotoPresentation = EMPTY_PHOTO,
    weather,
    todayJapan = getJapanCalendarDate(),
    nowJapanTime = getJapanWallClockTime(),
  } = input;

  const phase = getTripPhase(trip.startDate, trip.endDate, todayJapan);
  const totalDays = getTripDayCount(trip.startDate, trip.endDate);
  const remindersSettingsHref = getTripRemindersSettingsHref(trip.id);
  const heroBase = buildHeroBase(input);

  if (phase === "upcoming") {
    const countdownDays = getCalendarDaysUntil(todayJapan, trip.startDate);

    return {
      phase: "upcoming",
      hero: {
        ...heroBase,
        countdownDays,
        countdownLabel: formatCountdownLabel(countdownDays),
      },
      beforeJourney: buildBeforeJourney(
        {
          ...input,
          preparation,
          dayOnePhotoPresentation,
        },
        totalDays,
      ),
    } satisfies TripHomeUpcomingViewModel;
  }

  if (phase === "completed") {
    const destination = trip.destination ?? null;

    if (!input.financeRecap) {
      throw new Error("Completed trip home requires financeRecap");
    }

    return {
      phase: "completed",
      hero: {
        ...heroBase,
        tripIdentityLabel: resolveAfterTripIdentityLabel(trip.name, destination),
        completionMessage: "איזה טיול.",
        durationLabel: buildAfterTripDurationLabel(
          trip.startDate,
          trip.endDate,
          destination,
          trip.name,
        ),
      },
      memories: {
        href: `/app/trips/${trip.id}/memories`,
        title: "זיכרונות",
        description: "הרגעים מהטיול יחכו לך כאן.",
      },
      financeRecap: input.financeRecap,
      itineraryRevisit: {
        href: `/app/trips/${trip.id}/itinerary`,
        title: "המסלול של הטיול",
        description: "עברו שוב על הימים והרגעים",
      },
    } satisfies TripHomeCompletedViewModel;
  }

  const dayNumber = getTripDayNumber(trip.startDate, trip.endDate, todayJapan)!;
  const { nowActivity, nextActivity } = resolveNowAndNextUp(
    dayActivities,
    nowJapanTime,
  );
  const excludeIds = new Set<string>();
  if (nowActivity) {
    excludeIds.add(nowActivity.id);
  }
  if (nextActivity) {
    excludeIds.add(nextActivity.id);
  }

  const preview = buildActiveHomeItineraryPreview(
    dayActivities,
    dayTransports,
    nowJapanTime,
    excludeIds,
  );

  const importantToday =
    todayReminders.length > 0
      ? {
          reminders: todayReminders.map((reminder) => ({
            id: reminder.id,
            time: reminder.time,
            text: reminder.text,
          })),
          settingsHref: remindersSettingsHref,
        }
      : null;

  let now: TripHomeActiveViewModel["now"] = null;
  if (nowActivity) {
    now = toActivityCard(nowActivity, nowPhotoPresentation);
  }

  let upNext: TripHomeActiveViewModel["upNext"] = null;
  if (nextActivity) {
    upNext = toActivityCard(nextActivity, upNextPhotoPresentation);
  }

  let tonight: TripHomeActiveViewModel["tonight"] = null;
  if (tonightAccommodation) {
    tonight = {
      id: tonightAccommodation.id,
      name: tonightAccommodation.name,
      city: tonightAccommodation.city,
      stayContext: tonightAccommodation.dateRangeLabel,
      googleMapsUrl: tonightAccommodation.googleMapsUrl,
      photoPresentation: tonightPhotoPresentation,
    };
  }

  return {
    phase: "active",
    hero: {
      ...heroBase,
      currentDay: {
        dayNumber,
        totalDays,
        weekdayLabel: formatTripDayWeekday(todayJapan),
        dateLabel: formatTripDayDateLabel(todayJapan),
      },
      weather,
    },
    importantToday,
    todaysPlan: buildTodaysPlanSection(
      trip.id,
      todayJapan,
      dayNumber,
      totalDays,
      preview,
    ),
    now,
    upNext,
    tonight,
  } satisfies TripHomeActiveViewModel;
}
