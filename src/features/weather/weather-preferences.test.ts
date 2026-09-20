import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildWeatherPreferenceKey } from "./constants";
import {
  clearWeatherPreferenceCacheForTests,
  getWeatherLocationPreferenceSnapshot,
  readWeatherLocationPreference,
  resolveInitialWeatherLocation,
  writeWeatherLocationPreference,
} from "./weather-preferences";

const tripId = "507f1f77bcf86cd799439011";

describe("weather preferences", () => {
  beforeEach(() => {
    clearWeatherPreferenceCacheForTests();
    const storage = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        clear: () => storage.clear(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists normalized WeatherLocationRef per trip", () => {
    const location = {
      label: "Kyoto",
      region: "Kyoto",
      country: "Japan",
      latitude: 35.0116,
      longitude: 135.7681,
    };

    writeWeatherLocationPreference(tripId, location);
    const raw = window.localStorage.getItem(buildWeatherPreferenceKey(tripId));
    expect(raw).toContain("Kyoto");
    expect(readWeatherLocationPreference(tripId)).toEqual(location);
  });

  it("returns a stable snapshot reference for useSyncExternalStore", () => {
    const location = {
      label: "Haifa",
      region: "Haifa",
      country: "Israel",
      latitude: 32.794,
      longitude: 34.9896,
    };

    writeWeatherLocationPreference(tripId, location);

    const first = getWeatherLocationPreferenceSnapshot(tripId);
    const second = getWeatherLocationPreferenceSnapshot(tripId);

    expect(first).toEqual(location);
    expect(second).toBe(first);
  });

  it("falls back when preference is invalid", () => {
    window.localStorage.setItem(
      buildWeatherPreferenceKey(tripId),
      JSON.stringify({ label: "Bad", latitude: 999, longitude: 0, country: "X" }),
    );

    const fallback = {
      label: "Rome",
      country: "Italy",
      latitude: 41.9,
      longitude: 12.5,
    };

    expect(resolveInitialWeatherLocation(tripId, fallback)?.label).toBe("Rome");
  });

  it("isolates preferences between trips", () => {
    const otherTripId = "507f1f77bcf86cd799439012";
    writeWeatherLocationPreference(tripId, {
      label: "Paris",
      country: "France",
      latitude: 48.8566,
      longitude: 2.3522,
    });
    expect(readWeatherLocationPreference(otherTripId)).toBeNull();
  });
});
