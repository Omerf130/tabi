import { describe, expect, it } from "vitest";
import { extractFocusedDayWeather, isDateInWeatherSnapshot } from "./focused-day-weather";
import type { WeatherSnapshot } from "@/features/weather/types";

const snapshot: WeatherSnapshot = {
  location: {
    label: "Tokyo",
    country: "Japan",
    latitude: 35.6895,
    longitude: 139.6917,
  },
  current: {
    temperatureC: 20,
    feelsLikeC: 19,
    isDay: true,
    condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon-day.png" },
  },
  today: {
    date: "2026-10-26",
    minTemperatureC: 15,
    maxTemperatureC: 22,
    condition: { code: 1000, label: "בהיר", iconUrl: "https://cdn/icon-day.png" },
    chanceOfRainPercent: 10,
  },
  forecast: [
    {
      date: "2026-10-27",
      minTemperatureC: 14,
      maxTemperatureC: 21,
      condition: { code: 1003, label: "מעונן", iconUrl: "https://cdn/icon-cloud.png" },
      chanceOfRainPercent: 20,
    },
    {
      date: "2026-10-28",
      minTemperatureC: 13,
      maxTemperatureC: 20,
      condition: { code: 1063, label: "גשם", iconUrl: "https://cdn/icon-rain.png" },
      chanceOfRainPercent: 60,
    },
  ],
  hourly: [],
  observedAt: "2026-10-26 09:00",
};

describe("focused-day-weather", () => {
  it("detects dates inside the 3-day snapshot window", () => {
    expect(isDateInWeatherSnapshot(snapshot, "2026-10-26")).toBe(true);
    expect(isDateInWeatherSnapshot(snapshot, "2026-10-28")).toBe(true);
    expect(isDateInWeatherSnapshot(snapshot, "2026-10-29")).toBe(false);
  });

  it("uses current temperature for today", () => {
    expect(extractFocusedDayWeather(snapshot, "2026-10-26")).toEqual({
      temperatureC: 20,
      conditionIconUrl: "https://cdn/icon-day.png",
      conditionLabel: "בהיר",
    });
  });

  it("uses forecast max temperature for future in-window days", () => {
    expect(extractFocusedDayWeather(snapshot, "2026-10-27")).toEqual({
      temperatureC: 21,
      conditionIconUrl: "https://cdn/icon-cloud.png",
      conditionLabel: "מעונן",
    });
  });

  it("returns null outside the forecast window", () => {
    expect(extractFocusedDayWeather(snapshot, "2026-11-01")).toBeNull();
  });
});
