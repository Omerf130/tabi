import "server-only";

import {
  compareAccommodations,
  isAccommodationOccupiedOnDate,
} from "@/features/accommodations/accommodation-domain";
import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { extractFocusedDayWeather } from "@/features/itinerary/focused-day-weather";
import { listActivitiesForTripDay } from "@/features/itinerary/queries";
import { resolveDayLocation } from "@/features/itinerary/resolve-day-location.server";
import {
  listTripListItemsForTypes,
  listTripListsSummary,
} from "@/features/lists/queries";
import {
  buildAccommodationPhotoHref,
  buildActivityPhotoHref,
} from "@/features/place-images/build-place-photo-href";
import { getPlacePhotoPresentation } from "@/features/place-images/get-place-photo-presentation";
import { createPlacePhotoRequestContext } from "@/features/place-images/request-dedupe";
import { listTransportsForItineraryDay, listTransportsForTrip } from "@/features/transport/queries";
import type { TripWorkspace } from "@/features/trips/public-trip";
import {
  listIncompleteRemindersForUserTrip,
  listIncompleteRemindersForUserTripDay,
} from "@/features/trips/reminders/queries";
import { selectTodayHomeReminders } from "@/features/trips/reminders/select-today-home-reminders";
import { selectUpcomingHomeReminders } from "@/features/trips/reminders/select-upcoming-home-reminders";
import { getTripPhase } from "@/features/trips/trip-phase";
import { formatTemperatureC } from "@/features/weather/format-weather";
import { getWeatherSnapshot } from "@/features/weather/queries";
import { WeatherApiRequestError } from "@/features/weather/weatherapi.server";
import { prepareAfterTripFinanceRecap } from "@/features/finance/queries";
import { buildTripHomeViewModel } from "./build-trip-home-view-model";
import { buildDayOneHomePreview } from "./build-day-one-home-preview";
import { resolveTripHomePreviewContext } from "./resolve-trip-home-preview-context";
import {
  buildHomePreparation,
  PREPARATION_LIST_TYPES,
} from "./build-home-preparation";
import { resolveNowAndNextUp } from "./resolve-now-and-next-up";
import { selectDayOnePhotoSource } from "./select-day-one-photo-source";
import type { TripHomeHeroViewModel, TripHomeViewModel } from "./types";

function getTonightAccommodation(
  accommodations: readonly AccommodationViewModel[],
  todayJapan: string,
): AccommodationViewModel | null {
  const occupied = accommodations
    .filter((accommodation) =>
      isAccommodationOccupiedOnDate(
        accommodation.checkInDate,
        accommodation.checkOutDate,
        todayJapan,
      ),
    )
    .sort(compareAccommodations);

  return occupied[0] ?? null;
}

type PrepareTripHomePageOptions = {
  previewPhase?: string | null;
  previewTime?: string | null;
};

export async function prepareTripHomePage(
  trip: TripWorkspace,
  userId: string,
  options: PrepareTripHomePageOptions = {},
): Promise<TripHomeViewModel> {
  const previewContext = resolveTripHomePreviewContext({
    startDate: trip.startDate,
    endDate: trip.endDate,
    previewPhase: options.previewPhase,
    previewTime: options.previewTime,
  });
  const todayJapan = previewContext.todayJapan;
  const nowJapanTime = previewContext.nowJapanTime;
  const phase = getTripPhase(trip.startDate, trip.endDate, todayJapan);

  if (phase === "upcoming") {
    const photoContext = createPlacePhotoRequestContext();

    const [
      dayActivities,
      dayTransports,
      lists,
      listItems,
      reminderRecords,
      accommodations,
    ] = await Promise.all([
      listActivitiesForTripDay(trip.id, trip.startDate),
      listTransportsForItineraryDay(
        trip.id,
        trip.startDate,
        trip.startDate,
        trip.endDate,
      ),
      listTripListsSummary(trip.id),
      listTripListItemsForTypes(trip.id, PREPARATION_LIST_TYPES),
      listIncompleteRemindersForUserTrip(trip.id, userId),
      listAccommodationsForTrip(trip.id),
    ]);

    const dayOnePreview = buildDayOneHomePreview(
      trip.startDate,
      dayActivities,
      dayTransports,
      accommodations,
    );
    const photoSource = selectDayOnePhotoSource(
      dayActivities,
      dayTransports,
      dayOnePreview.accommodation,
    );

    let dayOnePhotoPresentation;
    if (photoSource?.kind === "activity") {
      dayOnePhotoPresentation = await getPlacePhotoPresentation({
        googlePlaceId: photoSource.googlePlaceId,
        photoHref: buildActivityPhotoHref(trip.id, photoSource.activityId),
        context: photoContext,
      });
    } else if (photoSource?.kind === "accommodation") {
      dayOnePhotoPresentation = await getPlacePhotoPresentation({
        googlePlaceId: photoSource.googlePlaceId,
        photoHref: buildAccommodationPhotoHref(
          trip.id,
          photoSource.accommodationId,
        ),
        context: photoContext,
      });
    }

    return buildTripHomeViewModel({
      trip,
      todayJapan,
      nowJapanTime,
      dayActivities,
      dayTransports,
      accommodations,
      preparation: buildHomePreparation(trip.id, lists, listItems),
      upcomingReminders: selectUpcomingHomeReminders(
        reminderRecords,
        todayJapan,
      ),
      dayOnePhotoPresentation,
    });
  }

  if (phase === "completed") {
    const financeRecap = await prepareAfterTripFinanceRecap(trip.id);
    return buildTripHomeViewModel({
      trip,
      todayJapan,
      nowJapanTime,
      financeRecap,
    });
  }

  const photoContext = createPlacePhotoRequestContext();

  const [
    dayActivities,
    dayTransports,
    todayReminderRecords,
    accommodations,
    transportRecords,
  ] = await Promise.all([
    listActivitiesForTripDay(trip.id, todayJapan),
    listTransportsForItineraryDay(
      trip.id,
      todayJapan,
      trip.startDate,
      trip.endDate,
    ),
    listIncompleteRemindersForUserTripDay(trip.id, userId, todayJapan),
    listAccommodationsForTrip(trip.id),
    listTransportsForTrip(trip.id),
  ]);

  const todayReminders = selectTodayHomeReminders(
    todayReminderRecords,
    phase,
    todayJapan,
  );

  const { nowActivity, nextActivity } = resolveNowAndNextUp(
    dayActivities,
    nowJapanTime,
  );

  const tonightAccommodation = getTonightAccommodation(accommodations, todayJapan);

  const transportRecordMap = new Map(
    transportRecords.map((record) => [record.id, record]),
  );

  let weather: TripHomeHeroViewModel["weather"];

  const resolvedLocation = await resolveDayLocation({
    date: todayJapan,
    accommodations,
    activities: dayActivities,
    dayTransports,
    transportRecords: transportRecordMap,
  });

  if (resolvedLocation) {
    try {
      const snapshot = await getWeatherSnapshot(resolvedLocation);
      const dayWeather = extractFocusedDayWeather(snapshot, todayJapan);
      if (dayWeather) {
        weather = {
          temperatureLabel: formatTemperatureC(dayWeather.temperatureC),
          conditionIconUrl: dayWeather.conditionIconUrl,
          conditionLabel: dayWeather.conditionLabel,
        };
      }
    } catch (error) {
      if (!(error instanceof WeatherApiRequestError)) {
        throw error;
      }
    }
  }

  const [nowPhotoPresentation, upNextPhotoPresentation, tonightPhotoPresentation] =
    await Promise.all([
      nowActivity?.googlePlaceId
        ? getPlacePhotoPresentation({
            googlePlaceId: nowActivity.googlePlaceId,
            photoHref: buildActivityPhotoHref(trip.id, nowActivity.id),
            context: photoContext,
          })
        : Promise.resolve(undefined),
      nextActivity?.googlePlaceId
        ? getPlacePhotoPresentation({
            googlePlaceId: nextActivity.googlePlaceId,
            photoHref: buildActivityPhotoHref(trip.id, nextActivity.id),
            context: photoContext,
          })
        : Promise.resolve(undefined),
      tonightAccommodation?.googlePlaceId
        ? getPlacePhotoPresentation({
            googlePlaceId: tonightAccommodation.googlePlaceId,
            photoHref: buildAccommodationPhotoHref(
              trip.id,
              tonightAccommodation.id,
            ),
            context: photoContext,
          })
        : Promise.resolve(undefined),
    ]);

  return buildTripHomeViewModel({
    trip,
    todayJapan,
    nowJapanTime,
    dayActivities,
    dayTransports,
    todayReminders,
    accommodations,
    tonightAccommodation,
    nowPhotoPresentation,
    upNextPhotoPresentation,
    tonightPhotoPresentation,
    weather,
  });
}
