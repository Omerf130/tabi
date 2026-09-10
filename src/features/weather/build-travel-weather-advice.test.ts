import { describe, expect, it } from "vitest";
import { buildTravelWeatherAdvice } from "./build-travel-weather-advice";
import type { WeatherSnapshot } from "./types";

function createSnapshot(
  overrides: Partial<WeatherSnapshot> & Pick<WeatherSnapshot, "current" | "today">,
): WeatherSnapshot {
  return {
    location: {
      label: "Test",
      country: "Japan",
      latitude: 1,
      longitude: 2,
    },
    forecast: [],
    hourly: [],
    observedAt: "2026-04-12 10:00",
    ...overrides,
  };
}

describe("buildTravelWeatherAdvice", () => {
  it("suggests an umbrella when rain probability is high", () => {
    const advice = buildTravelWeatherAdvice(
      createSnapshot({
        current: {
          temperatureC: 18,
          feelsLikeC: 18,
          isDay: true,
          condition: { code: 1003, label: "מעונן חלקית", iconUrl: "" },
        },
        today: {
          date: "2026-04-12",
          minTemperatureC: 12,
          maxTemperatureC: 20,
          condition: { code: 1003, label: "מעונן חלקית", iconUrl: "" },
          chanceOfRainPercent: 60,
        },
      }),
    );

    expect(advice.message).toContain("מטרייה");
  });

  it("suggests water on hot days", () => {
    const advice = buildTravelWeatherAdvice(
      createSnapshot({
        current: {
          temperatureC: 31,
          feelsLikeC: 33,
          isDay: true,
          condition: { code: 1000, label: "בהיר", iconUrl: "" },
        },
        today: {
          date: "2026-04-12",
          minTemperatureC: 24,
          maxTemperatureC: 33,
          condition: { code: 1000, label: "בהיר", iconUrl: "" },
          chanceOfRainPercent: 0,
        },
      }),
    );

    expect(advice.message).toContain("מים");
  });

  it("suggests a jacket on cold days", () => {
    const advice = buildTravelWeatherAdvice(
      createSnapshot({
        current: {
          temperatureC: 8,
          feelsLikeC: 6,
          isDay: true,
          condition: { code: 1003, label: "מעונן חלקית", iconUrl: "" },
        },
        today: {
          date: "2026-04-12",
          minTemperatureC: 6,
          maxTemperatureC: 11,
          condition: { code: 1003, label: "מעונן חלקית", iconUrl: "" },
          chanceOfRainPercent: 10,
        },
      }),
    );

    expect(advice.message).toContain("מעיל");
  });

  it("suggests a light layer on mild-cool days", () => {
    const advice = buildTravelWeatherAdvice(
      createSnapshot({
        current: {
          temperatureC: 16,
          feelsLikeC: 15,
          isDay: true,
          condition: { code: 1003, label: "מעונן חלקית", iconUrl: "" },
        },
        today: {
          date: "2026-04-12",
          minTemperatureC: 13,
          maxTemperatureC: 19,
          condition: { code: 1003, label: "מעונן חלקית", iconUrl: "" },
          chanceOfRainPercent: 10,
        },
      }),
    );

    expect(advice.message).toContain("שכבה קלה");
  });
});
