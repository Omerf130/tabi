import { WEATHER_PREFERENCE_KEY } from "./constants";
import { weatherLocationRefSchema } from "./schemas";
import type { WeatherLocationRef } from "./types";

type WeatherPreferenceListener = () => void;

const weatherPreferenceListeners = new Set<WeatherPreferenceListener>();

let cachedPreferenceRaw: string | null | undefined;
let cachedPreferenceSnapshot: WeatherLocationRef | null = null;

function locationsEqual(left: WeatherLocationRef, right: WeatherLocationRef): boolean {
  return (
    left.label === right.label &&
    left.region === right.region &&
    left.country === right.country &&
    left.latitude === right.latitude &&
    left.longitude === right.longitude
  );
}

function invalidateWeatherPreferenceCache(): void {
  cachedPreferenceRaw = undefined;
  cachedPreferenceSnapshot = null;
}

export function clearWeatherPreferenceCacheForTests(): void {
  invalidateWeatherPreferenceCache();
}

function notifyWeatherPreferenceListeners(): void {
  for (const listener of weatherPreferenceListeners) {
    listener();
  }
}

export function subscribeToWeatherLocationPreference(
  onStoreChange: () => void,
): () => void {
  weatherPreferenceListeners.add(onStoreChange);

  const onStorage = (event: StorageEvent) => {
    if (event.key === WEATHER_PREFERENCE_KEY || event.key === null) {
      onStoreChange();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    weatherPreferenceListeners.delete(onStoreChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function getWeatherLocationPreferenceSnapshot(): WeatherLocationRef | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(WEATHER_PREFERENCE_KEY);
  } catch {
    invalidateWeatherPreferenceCache();
    return null;
  }

  if (raw === cachedPreferenceRaw) {
    return cachedPreferenceSnapshot;
  }

  cachedPreferenceRaw = raw;

  if (!raw) {
    cachedPreferenceSnapshot = null;
    return null;
  }

  try {
    const parsed = weatherLocationRefSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      cachedPreferenceSnapshot = null;
      return null;
    }

    if (
      cachedPreferenceSnapshot &&
      locationsEqual(cachedPreferenceSnapshot, parsed.data)
    ) {
      return cachedPreferenceSnapshot;
    }

    cachedPreferenceSnapshot = parsed.data;
    return cachedPreferenceSnapshot;
  } catch {
    cachedPreferenceSnapshot = null;
    return null;
  }
}

export function readWeatherLocationPreference(): WeatherLocationRef | null {
  return getWeatherLocationPreferenceSnapshot();
}

export function writeWeatherLocationPreference(location: WeatherLocationRef): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const nextRaw = JSON.stringify(location);
    if (nextRaw === cachedPreferenceRaw) {
      return;
    }

    window.localStorage.setItem(WEATHER_PREFERENCE_KEY, nextRaw);
    cachedPreferenceRaw = nextRaw;
    cachedPreferenceSnapshot = location;
    notifyWeatherPreferenceListeners();
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export function resolveInitialWeatherLocation(
  fallback: WeatherLocationRef,
): WeatherLocationRef {
  const preference = readWeatherLocationPreference();
  return preference ?? fallback;
}
