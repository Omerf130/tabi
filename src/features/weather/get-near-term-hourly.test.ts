import { describe, expect, it } from "vitest";
import {
  buildNearTermWeatherColumns,
  hasHourlyWeatherData,
  shouldShowNearTermStrip,
} from "./get-near-term-hourly";
import type { WeatherSnapshot } from "./types";

function createSnapshot(hourly: WeatherSnapshot["hourly"]): WeatherSnapshot {
  return {
    location: {
      label: "Haifa",
      country: "Israel",
      latitude: 32.794,
      longitude: 34.9896,
    },
    current: {
      temperatureC: 27,
      feelsLikeC: 28,
      isDay: true,
      condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
    },
    today: {
      date: "2026-09-10",
      minTemperatureC: 25,
      maxTemperatureC: 28,
      condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
      chanceOfRainPercent: 0,
    },
    forecast: [],
    hourly,
    observedAt: "2026-09-10 10:00",
  };
}

describe("get-near-term-hourly", () => {
  it("detects hourly data from normalized snapshot", () => {
    const snapshot = createSnapshot([
      {
        time: "2026-09-10 11:00",
        temperatureC: 28,
        isDay: true,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
      },
    ]);

    expect(hasHourlyWeatherData(snapshot)).toBe(true);
  });

  it("builds near-term columns from real hourly values only", () => {
    const snapshot = createSnapshot([
      {
        time: "2026-09-10 11:00",
        temperatureC: 28,
        isDay: true,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
      },
      {
        time: "2026-09-10 14:00",
        temperatureC: 29,
        isDay: true,
        condition: { code: 1003, label: "מעונן חלקית", iconUrl: "https://cdn/icon2.png" },
      },
      {
        time: "2026-09-10 17:00",
        temperatureC: 27,
        isDay: true,
        condition: { code: 1003, label: "מעונן חלקית", iconUrl: "https://cdn/icon2.png" },
      },
      {
        time: "2026-09-10 20:00",
        temperatureC: 26,
        isDay: false,
        condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon.png" },
      },
    ]);

    const columns = buildNearTermWeatherColumns(snapshot);

    expect(columns[0]).toMatchObject({ label: "עכשיו", temperatureC: 27, isNow: true });
    expect(columns.length).toBeGreaterThanOrEqual(2);
    expect(columns.some((column) => column.temperatureC === 28)).toBe(true);
    expect(shouldShowNearTermStrip(snapshot)).toBe(true);
  });

  it("does not show near-term strip without future hourly slots", () => {
    const snapshot = createSnapshot([]);

    expect(shouldShowNearTermStrip(snapshot)).toBe(false);
    expect(buildNearTermWeatherColumns(snapshot)).toEqual([
      expect.objectContaining({ label: "עכשיו", temperatureC: 27 }),
    ]);
  });
});
