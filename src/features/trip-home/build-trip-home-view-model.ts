import type { AccommodationViewModel } from "@/features/accommodations/types";
import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { ActivityViewModel } from "@/features/itinerary/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import type { TripReminderViewModel } from "@/features/trips/reminders/types";
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
  buildAccommodationNavigationHref,
  buildActivityNavigationHref,
} from "@/lib/maps/navigation-entities";
import type { PreferredMapsApp } from "@/lib/maps/maps-app";
import {
  buildAfterTripDurationLabel,
  resolveAfterTripIdentityLabel,
} from "./build-after-trip-hero";
import { buildDayOneHomePreview } from "./build-day-one-home-preview";
import {
  buildActiveHomeItineraryPreview,
} from "./build-home-itinerary-preview";
import { buildAfterTripSummary } from "./build-after-trip-summary";
import type { HomePreparationViewModel } from "./build-home-preparation";
import {
  resolveTripCountdownReferenceMs,
  resolveTripCountdownTargetMs,
} from "./resolve-trip-countdown";
import { resolveNowAndNextUp } from "./resolve-now-and-next-up";
import type { AfterTripFinanceRecapViewModel } from "@/features/finance/types";
import type {
  TripHomeActiveViewModel,
  TripHomeBeforeJourneyViewModel,
  TripHomeCompletedViewModel,
  TripHomeDayOnePreview,
  TripHomeHeroViewModel,
  TripHomeItinerarySection,
  TripHomeRemindersManagerData,
  TripHomeUpcomingViewModel,
  TripHomeViewModel,
} from "./types";

const EMPTY_PHOTO: PlacePhotoPresentation = {
  hasPhoto: false,
  authorAttributions: [],
};

export type TripHomeTranslations = {
  tHome: AppTranslator<"Home">;
  tCommon: AppTranslator<"Common">;
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
  todayTripLocal: string;
  nowTripLocal: string;
  financeRecap?: AfterTripFinanceRecapViewModel;
  activityCount?: number;
  accommodationCount?: number;
  usePreviewCountdownReference?: boolean;
  allReminders?: readonly TripReminderViewModel[];
  preferredMapsApp?: PreferredMapsApp;
  translations: TripHomeTranslations;
};

function buildRemindersManager(
  input: BuildTripHomeViewModelInput,
  currentTripDate: string,
): TripHomeRemindersManagerData {
  return {
    tripId: input.trip.id,
    startDate: input.trip.startDate,
    endDate: input.trip.endDate,
    currentTripDate,
    reminders: [...(input.allReminders ?? [])],
  };
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
  translations: TripHomeTranslations,
): TripHomeDayOnePreview {
  const { tHome, tCommon } = translations;

  return {
    weekdayLabel: formatTripDayWeekday(startDate),
    dateLabel: formatTripDayDateLabel(startDate),
    dayMeta: tCommon("dayMeta", { dayNumber: 1, totalDays }),
    items: preview.items,
    overflowCount: preview.overflowCount,
    isEmpty: preview.isEmpty,
    emptyMessage: tHome("dayOneEmpty"),
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
    translations,
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
    dayOne: buildDayOnePreviewSection(
      trip.id,
      trip.startDate,
      totalDays,
      dayOnePreview,
      dayOnePhotoPresentation,
      translations,
    ),
    itineraryCta: {
      label: translations.tHome("itineraryCta"),
      href: itineraryHref,
    },
  };
}

function buildTodaysPlanSection(
  tripId: string,
  todayTripLocal: string,
  dayNumber: number,
  totalDays: number,
  preview: ReturnType<typeof buildActiveHomeItineraryPreview>,
  translations: TripHomeTranslations,
): TripHomeItinerarySection {
  const { tHome, tCommon } = translations;
  const itineraryHref = `/app/trips/${tripId}/itinerary/${todayTripLocal}`;

  return {
    title: tHome("todaysPlanTitle"),
    subtitle: `${formatTripDayWeekday(todayTripLocal)} · ${formatTripDayDateLabel(todayTripLocal)}`,
    dayMeta: tCommon("dayMeta", { dayNumber, totalDays }),
    items: preview.items,
    overflowCount: preview.overflowCount,
    isEmpty: preview.isEmpty,
    emptyMessage: tHome("todaysPlanEmptyDay"),
    ctaLabel: preview.isEmpty
      ? tHome("todaysPlanEmptyCta")
      : tHome("todaysPlanFullCta"),
    ctaHref: itineraryHref,
  };
}

function toActivityCard(
  activity: ActivityViewModel,
  photoPresentation: PlacePhotoPresentation,
  preferredMapsApp: PreferredMapsApp,
): TripHomeActiveViewModel["now"] {
  const navigationHref =
    activity.navigationHref ??
    buildActivityNavigationHref(activity, preferredMapsApp) ??
    undefined;

  return {
    id: activity.id,
    title: activity.title,
    timeLabel: activity.startTime
      ? activity.endTime
        ? `${activity.startTime}–${activity.endTime}`
        : activity.startTime
      : undefined,
    locationName: activity.locationName,
    navigationHref,
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
    todayTripLocal,
    nowTripLocal,
    translations,
    preferredMapsApp,
  } = input;

  const phase = getTripPhase(trip.startDate, trip.endDate, todayTripLocal);
  const totalDays = getTripDayCount(trip.startDate, trip.endDate);
  const heroBase = buildHeroBase(input);
  const { tHome } = translations;

  if (phase === "upcoming") {
    const referenceMs = input.usePreviewCountdownReference
      ? resolveTripCountdownReferenceMs({
          previewCalendarDate: todayTripLocal,
          previewWallClock: nowTripLocal,
        })
      : undefined;

    return {
      phase: "upcoming",
      hero: heroBase,
      countdown: {
        targetMs: resolveTripCountdownTargetMs(trip.startDate),
        referenceMs,
      },
      beforeJourney: buildBeforeJourney(
        {
          ...input,
          preparation,
          dayOnePhotoPresentation,
        },
        totalDays,
      ),
      remindersManager: buildRemindersManager(input, todayTripLocal),
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
        completionMessage: tHome("tripCompleted"),
        durationLabel: buildAfterTripDurationLabel(
          trip.startDate,
          trip.endDate,
          tHome,
          destination,
          trip.name,
        ),
      },
      tripSummary: buildAfterTripSummary(
        {
          startDate: trip.startDate,
          endDate: trip.endDate,
          activityCount: input.activityCount ?? 0,
          accommodationCount: input.accommodationCount ?? 0,
        },
        tHome,
      ),
      financeRecap: input.financeRecap,
      itineraryRevisit: {
        href: `/app/trips/${trip.id}/itinerary`,
        title: tHome("itineraryRevisitTitle"),
        description: tHome("itineraryRevisitDescription"),
      },
    } satisfies TripHomeCompletedViewModel;
  }

  const dayNumber = getTripDayNumber(trip.startDate, trip.endDate, todayTripLocal)!;
  const { nowActivity, nextActivity } = resolveNowAndNextUp(
    dayActivities,
    nowTripLocal,
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
    nowTripLocal,
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
        }
      : null;

  let now: TripHomeActiveViewModel["now"] = null;
  if (nowActivity) {
    now = toActivityCard(nowActivity, nowPhotoPresentation, preferredMapsApp);
  }

  let upNext: TripHomeActiveViewModel["upNext"] = null;
  if (nextActivity) {
    upNext = toActivityCard(nextActivity, upNextPhotoPresentation, preferredMapsApp);
  }

  let tonight: TripHomeActiveViewModel["tonight"] = null;
  if (tonightAccommodation) {
    const navigationHref =
      buildAccommodationNavigationHref(
        tonightAccommodation,
        preferredMapsApp,
      ) ?? undefined;
    tonight = {
      id: tonightAccommodation.id,
      name: tonightAccommodation.name,
      city: tonightAccommodation.city,
      stayContext: tonightAccommodation.dateRangeLabel,
      navigationHref,
      photoPresentation: tonightPhotoPresentation,
    };
  }

  const todaysPlan = buildTodaysPlanSection(
    trip.id,
    todayTripLocal,
    dayNumber,
    totalDays,
    preview,
    translations,
  );

  return {
    phase: "active",
    hero: {
      ...heroBase,
      currentDay: {
        dayNumber,
        totalDays,
        weekdayLabel: formatTripDayWeekday(todayTripLocal),
        dateLabel: formatTripDayDateLabel(todayTripLocal),
      },
      weather,
    },
    importantToday,
    todaysPlan,
    now,
    upNext,
    tonight,
    todaySummary: {
      tonightName: tonight?.name,
      weatherLabel: weather?.temperatureLabel,
      weatherIconUrl: weather?.conditionIconUrl,
      todayItemCount: todaysPlan.isEmpty
        ? undefined
        : todaysPlan.items.length + todaysPlan.overflowCount,
      todayPlanHref: todaysPlan.ctaHref,
    },
    remindersManager: buildRemindersManager(input, todayTripLocal),
  } satisfies TripHomeActiveViewModel;
}
