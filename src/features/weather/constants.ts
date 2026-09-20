import type { WeatherLocationRef } from "./types";

export const WEATHER_PREFERENCE_KEY_PREFIX = "tabi.weather.v1.location";

export function buildWeatherPreferenceKey(tripId: string): string {
  return `${WEATHER_PREFERENCE_KEY_PREFIX}.${tripId}`;
}

export const WEATHER_SEARCH_DEBOUNCE_MS = 300;
export const WEATHER_SEARCH_MIN_INPUT_LENGTH = 3;

export const WEATHER_SNAPSHOT_REVALIDATE_SECONDS = 900;
export const WEATHER_SEARCH_REVALIDATE_SECONDS = 86_400;

/** Hebrew localization for Weather Google Places fallback only. */
export const WEATHER_PLACES_SEARCH_LANGUAGE_CODE = "he";

export const WEATHER_FORECAST_DAYS = 3;

export const WEATHER_API_BASE = "https://api.weatherapi.com/v1";

export function buildWeatherHref(tripId: string): string {
  return `/app/trips/${tripId}/weather`;
}

export function buildWeatherSearchHref(tripId: string, query: string): string {
  const params = new URLSearchParams({ q: query });
  return `/app/trips/${tripId}/weather/search?${params.toString()}`;
}

export function buildWeatherSnapshotHref(
  tripId: string,
  location: WeatherLocationRef,
): string {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    label: location.label,
    country: location.country,
  });
  if (location.region) {
    params.set("region", location.region);
  }
  return `/app/trips/${tripId}/weather/snapshot?${params.toString()}`;
}

export function makeWeatherLocationKey(location: WeatherLocationRef): string {
  return `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
}
