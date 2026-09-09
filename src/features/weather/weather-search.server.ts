import "server-only";

import {
  isGooglePlacesFallbackError,
  searchWeatherLocationsViaGooglePlaces,
} from "./google-places-fallback.server";
import { searchWeatherLocations } from "./weatherapi.server";
import type { WeatherLocationRef } from "./types";

export async function searchWeatherLocationsWithFallback(
  query: string,
): Promise<WeatherLocationRef[]> {
  const weatherResults = await searchWeatherLocations(query);
  if (weatherResults.length > 0) {
    return weatherResults;
  }

  try {
    return await searchWeatherLocationsViaGooglePlaces(query);
  } catch (error) {
    if (isGooglePlacesFallbackError(error)) {
      return [];
    }

    throw error;
  }
}
