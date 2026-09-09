import type { WeatherLocationRef } from "./types";

export const DEFAULT_WEATHER_LOCATION: WeatherLocationRef = {
  label: "Tokyo",
  region: "Tokyo",
  country: "Japan",
  latitude: 35.6895,
  longitude: 139.6917,
};

export const WEATHER_PREFERENCE_KEY = "tabi.weather.v1.location";

export const WEATHER_SEARCH_DEBOUNCE_MS = 300;
export const WEATHER_SEARCH_MIN_INPUT_LENGTH = 3;

export const WEATHER_SNAPSHOT_REVALIDATE_SECONDS = 900;
export const WEATHER_SEARCH_REVALIDATE_SECONDS = 86_400;

/** Hebrew localization for Weather Google Places fallback only. */
export const WEATHER_PLACES_SEARCH_LANGUAGE_CODE = "he";

export const WEATHER_FORECAST_DAYS = 3;

export const WEATHER_MESSAGES = {
  loadFailed: "לא ניתן לטעון את מזג האוויר כרגע.",
  retry: "נסה שוב",
  refreshFailed:
    "לא הצלחנו לרענן את מזג האוויר. מוצג המידע האחרון שנטען.",
  updated: "עודכן",
  feelsLike: "מרגיש כמו",
  today: "היום",
  forecast: "תחזית",
  rainChance: "סיכוי לגשם",
  searchPlaceholder: "חיפוש עיר או יעד...",
  changeLocation: "שינוי מיקום",
  noResults: "לא נמצאו מיקומים",
  invalidLocation: "מיקום לא תקין",
} as const;

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
