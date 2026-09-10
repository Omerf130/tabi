import "server-only";

import {
  compareAccommodations,
  isAccommodationOccupiedOnDate,
} from "@/features/accommodations/accommodation-domain";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { TransportRecord } from "@/features/transport/types";
import { getWeatherSnapshot } from "@/features/weather/queries";
import { formatTemperatureC } from "@/features/weather/format-weather";
import { WeatherApiRequestError } from "@/features/weather/weatherapi.server";
import type { ActivityViewModel } from "./types";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import { extractFocusedDayWeather } from "./focused-day-weather";
import { resolveDayLocation } from "./resolve-day-location.server";
import type { ItineraryDayHeaderViewModel } from "./types";

function buildAccommodationContext(
  accommodations: readonly AccommodationViewModel[],
  date: string,
): string | undefined {
  const occupied = accommodations
    .filter((accommodation) =>
      isAccommodationOccupiedOnDate(
        accommodation.checkInDate,
        accommodation.checkOutDate,
        date,
      ),
    )
    .sort(compareAccommodations);

  const primary = occupied[0];
  if (!primary) {
    return undefined;
  }

  if (primary.checkInDate === date) {
    return `צ'ק-אין: ${primary.name}`;
  }

  if (primary.checkOutDate === date) {
    return `צ'ק-אאוט: ${primary.name}`;
  }

  return `הלילה ישנים ב־${primary.name}`;
}

export async function resolveDayHeaderContext(input: {
  date: string;
  dayNumber: number;
  weekdayLabel: string;
  dateLabel: string;
  isToday: boolean;
  activities: readonly ActivityViewModel[];
  transports: readonly TransportItineraryItemViewModel[];
  accommodations: readonly AccommodationViewModel[];
  transportRecords: ReadonlyMap<string, TransportRecord>;
}): Promise<Pick<ItineraryDayHeaderViewModel, "locationLabel" | "weather" | "accommodationContext">> {
  const accommodationContext = buildAccommodationContext(
    input.accommodations,
    input.date,
  );

  const resolvedLocation = await resolveDayLocation({
    date: input.date,
    accommodations: input.accommodations,
    activities: input.activities,
    dayTransports: input.transports,
    transportRecords: input.transportRecords,
  });

  if (!resolvedLocation) {
    return { accommodationContext };
  }

  try {
    const snapshot = await getWeatherSnapshot(resolvedLocation);
    const dayWeather = extractFocusedDayWeather(snapshot, input.date);
    if (!dayWeather) {
      return {
        accommodationContext,
        locationLabel: resolvedLocation.label,
      };
    }

    return {
      accommodationContext,
      locationLabel: resolvedLocation.label,
      weather: {
        temperatureLabel: formatTemperatureC(dayWeather.temperatureC),
        conditionIconUrl: dayWeather.conditionIconUrl,
        conditionLabel: dayWeather.conditionLabel,
        locationLabel: resolvedLocation.label,
      },
    };
  } catch (error) {
    if (!(error instanceof WeatherApiRequestError)) {
      throw error;
    }
  }

  return {
    accommodationContext,
    locationLabel: resolvedLocation.label,
  };
}
