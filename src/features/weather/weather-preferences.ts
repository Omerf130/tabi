import { buildWeatherPreferenceKey } from "./constants";
import { weatherLocationRefSchema } from "./schemas";
import type { WeatherLocationRef } from "./types";

type WeatherPreferenceListener = () => void;

const weatherPreferenceListeners = new Set<WeatherPreferenceListener>();

let cachedPreferenceKey: string | undefined;
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
  cachedPreferenceKey = undefined;
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
  tripId: string,
  onStoreChange: () => void,
): () => void {
  weatherPreferenceListeners.add(onStoreChange);

  const preferenceKey = buildWeatherPreferenceKey(tripId);

  const onStorage = (event: StorageEvent) => {
    if (event.key === preferenceKey || event.key === null) {
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

export function getWeatherLocationPreferenceSnapshot(
  tripId: string,
): WeatherLocationRef | null {
  if (typeof window === "undefined") {
    return null;
  }

  const preferenceKey = buildWeatherPreferenceKey(tripId);

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(preferenceKey);
  } catch {
    invalidateWeatherPreferenceCache();
    return null;
  }

  if (cachedPreferenceKey === preferenceKey && raw === cachedPreferenceRaw) {
    return cachedPreferenceSnapshot;
  }

  cachedPreferenceKey = preferenceKey;
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

export function readWeatherLocationPreference(tripId: string): WeatherLocationRef | null {
  return getWeatherLocationPreferenceSnapshot(tripId);
}

export function writeWeatherLocationPreference(
  tripId: string,
  location: WeatherLocationRef,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const preferenceKey = buildWeatherPreferenceKey(tripId);

  try {
    const nextRaw = JSON.stringify(location);
    if (cachedPreferenceKey === preferenceKey && nextRaw === cachedPreferenceRaw) {
      return;
    }

    window.localStorage.setItem(preferenceKey, nextRaw);
    cachedPreferenceKey = preferenceKey;
    cachedPreferenceRaw = nextRaw;
    cachedPreferenceSnapshot = location;
    notifyWeatherPreferenceListeners();
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export function resolveInitialWeatherLocation(
  tripId: string,
  fallback: WeatherLocationRef | null,
): WeatherLocationRef | null {
  const preference = readWeatherLocationPreference(tripId);
  return preference ?? fallback;
}
