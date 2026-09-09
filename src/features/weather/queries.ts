import "server-only";

import { DEFAULT_WEATHER_LOCATION } from "./constants";
import {
  fetchWeatherForecast,
  WeatherApiRequestError,
} from "./weatherapi.server";
import type { WeatherLocationRef, WeatherPageInitialData, WeatherSnapshot } from "./types";

export async function getWeatherSnapshot(
  location: WeatherLocationRef,
): Promise<WeatherSnapshot> {
  return fetchWeatherForecast(location);
}

export async function prepareWeatherPage(tripId: string): Promise<WeatherPageInitialData> {
  let initialSnapshot: WeatherSnapshot | null = null;

  try {
    initialSnapshot = await getWeatherSnapshot(DEFAULT_WEATHER_LOCATION);
  } catch (error) {
    if (!(error instanceof WeatherApiRequestError)) {
      throw error;
    }
  }

  return {
    tripId,
    defaultLocation: DEFAULT_WEATHER_LOCATION,
    initialSnapshot,
  };
}
