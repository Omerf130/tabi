import "server-only";

import {
  compareAccommodations,
  isAccommodationOccupiedOnDate,
} from "@/features/accommodations/accommodation-domain";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { getJapanWallClockTime } from "@/features/trips/japan-wall-clock";
import { getTripPhase } from "@/features/trips/trip-phase";
import {
  formatTripDayDateLabel,
  formatTripDayWeekday,
  getTripDayNumber,
  getTripDayTemporalState,
} from "@/features/trips/trip-days";
import type { TransportItineraryItemViewModel, TransportRecord } from "@/features/transport/types";
import type { ItineraryDayItem } from "@/features/transport/merge-itinerary-day-items";
import { getWeatherSnapshot } from "@/features/weather/queries";
import { formatTemperatureC } from "@/features/weather/format-weather";
import { WeatherApiRequestError } from "@/features/weather/weatherapi.server";
import { extractFocusedDayWeather } from "./focused-day-weather";
import { resolveDayLocation } from "./resolve-day-location.server";
import { resolveNextTwoDayItems } from "./resolve-next-two-day-items";
import { buildItineraryDayHref } from "./routes";
import type {
  ActivityViewModel,
  FocusedDayCardViewModel,
  FocusedDayNextItemViewModel,
} from "./types";

export type BuildFocusedDayCardInput = {
  tripId: string;
  focusedDate: string;
  startDate: string;
  endDate: string;
  activities: readonly ActivityViewModel[];
  dayTransports: readonly TransportItineraryItemViewModel[];
  transportRecords: ReadonlyMap<string, TransportRecord>;
  accommodations: readonly AccommodationViewModel[];
  incompleteReminderCount: number;
  todayJapan?: string;
};

function getPrimaryOccupiedAccommodation(
  accommodations: readonly AccommodationViewModel[],
  date: string,
): AccommodationViewModel | undefined {
  return accommodations
    .filter((accommodation) =>
      isAccommodationOccupiedOnDate(
        accommodation.checkInDate,
        accommodation.checkOutDate,
        date,
      ),
    )
    .sort(compareAccommodations)[0];
}

function toNextItemViewModel(item: ItineraryDayItem): FocusedDayNextItemViewModel {
  if (item.kind === "activity") {
    return {
      timeLabel: item.activity.startTime,
      title: item.activity.title,
    };
  }

  return {
    timeLabel: item.transport.departureTime,
    title: `${item.transport.typeLabel} · ${item.transport.routeLabel}`,
  };
}

export async function buildFocusedDayCard({
  tripId,
  focusedDate,
  startDate,
  endDate,
  activities,
  dayTransports,
  transportRecords,
  accommodations,
  incompleteReminderCount,
  todayJapan = getJapanCalendarDate(),
}: BuildFocusedDayCardInput): Promise<FocusedDayCardViewModel> {
  const phase = getTripPhase(startDate, endDate, todayJapan);
  const temporalState = getTripDayTemporalState(focusedDate, todayJapan);
  const dayNumber = getTripDayNumber(startDate, endDate, focusedDate)!;
  const dayActivities = activities.filter((activity) => activity.date === focusedDate);
  const filterPassed = phase === "active" && focusedDate === todayJapan;

  const nextItems = resolveNextTwoDayItems({
    activities: dayActivities,
    transports: dayTransports,
    filterPassed,
    nowJapanTime: filterPassed ? getJapanWallClockTime() : undefined,
  }).map(toNextItemViewModel);

  const primaryAccommodation = getPrimaryOccupiedAccommodation(accommodations, focusedDate);

  let weather: FocusedDayCardViewModel["weather"];
  const resolvedLocation = await resolveDayLocation({
    date: focusedDate,
    accommodations,
    activities,
    dayTransports,
    transportRecords,
  });

  if (resolvedLocation) {
    try {
      const snapshot = await getWeatherSnapshot(resolvedLocation);
      const dayWeather = extractFocusedDayWeather(snapshot, focusedDate);
      if (dayWeather) {
        weather = {
          temperatureLabel: formatTemperatureC(dayWeather.temperatureC),
          conditionIconUrl: dayWeather.conditionIconUrl,
          conditionLabel: dayWeather.conditionLabel,
          locationLabel: resolvedLocation.label,
        };
      }
    } catch (error) {
      if (!(error instanceof WeatherApiRequestError)) {
        throw error;
      }
    }
  }

  return {
    date: focusedDate,
    dayNumber,
    weekdayLabel: formatTripDayWeekday(focusedDate),
    dateLabel: formatTripDayDateLabel(focusedDate),
    temporalState,
    href: buildItineraryDayHref(tripId, focusedDate),
    showTodayBadge: phase === "active" && focusedDate === todayJapan,
    weather,
    accommodationName: primaryAccommodation?.name,
    nextItems,
    transportCount: dayTransports.length,
    incompleteReminderCount,
  };
}
