import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WEATHER_PREFERENCE_KEY } from "./constants";
import {
  clearWeatherPreferenceCacheForTests,
  getWeatherLocationPreferenceSnapshot,
  readWeatherLocationPreference,
  resolveInitialWeatherLocation,
  writeWeatherLocationPreference,
} from "./weather-preferences";

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

  it("persists normalized WeatherLocationRef only", () => {
    const location = {
      label: "Kyoto",
      region: "Kyoto",
      country: "Japan",
      latitude: 35.0116,
      longitude: 135.7681,
    };

    writeWeatherLocationPreference(location);
    const raw = window.localStorage.getItem(WEATHER_PREFERENCE_KEY);
    expect(raw).toContain("Kyoto");
    expect(raw).not.toContain("provider");
    expect(readWeatherLocationPreference()).toEqual(location);
  });

  it("returns a stable snapshot reference for useSyncExternalStore", () => {
    const location = {
      label: "Haifa",
      region: "Haifa",
      country: "Israel",
      latitude: 32.794,
      longitude: 34.9896,
    };

    writeWeatherLocationPreference(location);

    const first = getWeatherLocationPreferenceSnapshot();
    const second = getWeatherLocationPreferenceSnapshot();

    expect(first).toEqual(location);
    expect(second).toBe(first);
  });

  it("falls back to Tokyo when preference is invalid", () => {
    window.localStorage.setItem(
      WEATHER_PREFERENCE_KEY,
      JSON.stringify({ label: "Bad", latitude: 999, longitude: 0, country: "X" }),
    );

    expect(
      resolveInitialWeatherLocation({
        label: "Tokyo",
        region: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      }).label,
    ).toBe("Tokyo");
  });
});
