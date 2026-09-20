import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { loadTripDestinationContext } from "@/features/trips/destination/load-trip-destination-context";
import {
  fetchWeatherForecast,
  WeatherApiRequestError,
} from "./weatherapi.server";
import { resolveWeatherSeedFromDestination } from "./resolve-weather-seed-from-destination";
import type { WeatherLocationRef, WeatherPageInitialData, WeatherSnapshot } from "./types";

export async function getWeatherSnapshot(
  location: WeatherLocationRef,
): Promise<WeatherSnapshot> {
  return fetchWeatherForecast(location);
}

export async function prepareWeatherPage(tripId: string): Promise<WeatherPageInitialData> {
  await connectDb();
  const trip = await Trip.findById(tripId).select("destination").lean();

  const destinationContext = await loadTripDestinationContext({
    tripId,
    destination: trip?.destination ?? undefined,
  });

  const defaultLocation = resolveWeatherSeedFromDestination(destinationContext);
  let initialSnapshot: WeatherSnapshot | null = null;

  if (defaultLocation) {
    try {
      initialSnapshot = await getWeatherSnapshot(defaultLocation);
    } catch (error) {
      if (!(error instanceof WeatherApiRequestError)) {
        throw error;
      }
    }
  }

  return {
    tripId,
    defaultLocation,
    initialSnapshot,
  };
}
