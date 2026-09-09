import "server-only";

import {
  GooglePlacesConfigError,
  GooglePlacesRequestError,
  autocompleteGeographicPlaces,
  fetchPlaceGeographyDetails,
} from "@/features/places/googlePlaces.server";
import { createPlaceSessionToken } from "@/features/places/placeSession";
import {
  WEATHER_PLACES_SEARCH_LANGUAGE_CODE,
  WEATHER_SEARCH_REVALIDATE_SECONDS,
} from "./constants";
import { normalizeGooglePlaceToWeatherLocation } from "./normalize-google-place";
import type { WeatherLocationRef } from "./types";

export async function searchWeatherLocationsViaGooglePlaces(
  query: string,
): Promise<WeatherLocationRef[]> {
  const sessionToken = createPlaceSessionToken();
  const suggestions = await autocompleteGeographicPlaces({
    query,
    sessionToken,
    languageCode: WEATHER_PLACES_SEARCH_LANGUAGE_CODE,
    revalidateSeconds: WEATHER_SEARCH_REVALIDATE_SECONDS,
  });

  if (suggestions.length === 0) {
    return [];
  }

  const resolved = await Promise.all(
    suggestions.map(async (suggestion) => {
      try {
        const details = await fetchPlaceGeographyDetails(suggestion.placeId, {
          sessionToken,
          languageCode: WEATHER_PLACES_SEARCH_LANGUAGE_CODE,
          revalidateSeconds: WEATHER_SEARCH_REVALIDATE_SECONDS,
        });

        return normalizeGooglePlaceToWeatherLocation(details, {
          primaryText: suggestion.primaryText,
          secondaryText: suggestion.secondaryText,
        });
      } catch {
        return null;
      }
    }),
  );

  return resolved.filter((location): location is WeatherLocationRef => location !== null);
}

export function isGooglePlacesFallbackError(error: unknown): boolean {
  return (
    error instanceof GooglePlacesConfigError || error instanceof GooglePlacesRequestError
  );
}
