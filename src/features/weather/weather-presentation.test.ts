import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { WEATHER_FORECAST_DAYS, WEATHER_SNAPSHOT_REVALIDATE_SECONDS } from "./constants";
import { formatHighLowRange, formatForecastRowLabel } from "./format-weather";
import {
  buildNearTermWeatherColumns,
  hasHourlyWeatherData,
  shouldShowNearTermStrip,
} from "./get-near-term-hourly";
import { getWeatherForecastDaysForDisplay } from "./get-weather-forecast-days";
import { buildTravelWeatherAdvice } from "./build-travel-weather-advice";
import type { WeatherSnapshot } from "./types";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const sampleSnapshot: WeatherSnapshot = {
  location: {
    label: "Kyoto",
    region: "Kyoto",
    country: "Japan",
    latitude: 35.0116,
    longitude: 135.7681,
  },
  current: {
    temperatureC: 18,
    feelsLikeC: 17,
    isDay: true,
    condition: {
      code: 1003,
      label: "מעונן חלקית",
      iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/116.png",
    },
  },
  today: {
    date: "2026-04-12",
    minTemperatureC: 12,
    maxTemperatureC: 22,
    condition: {
      code: 1003,
      label: "מעונן חלקית",
      iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/116.png",
    },
    chanceOfRainPercent: 10,
  },
  forecast: [
    {
      date: "2026-04-13",
      minTemperatureC: 11,
      maxTemperatureC: 20,
      condition: {
        code: 1000,
        label: "בהיר",
        iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/113.png",
      },
      chanceOfRainPercent: 5,
    },
    {
      date: "2026-04-14",
      minTemperatureC: 13,
      maxTemperatureC: 22,
      condition: {
        code: 1003,
        label: "מעונן חלקית",
        iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/116.png",
      },
      chanceOfRainPercent: 20,
    },
  ],
  hourly: [
    {
      time: "2026-04-12 11:00",
      temperatureC: 19,
      isDay: true,
      condition: {
        code: 1000,
        label: "בהיר",
        iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/113.png",
      },
    },
    {
      time: "2026-04-12 14:00",
      temperatureC: 21,
      isDay: true,
      condition: {
        code: 1003,
        label: "מעונן חלקית",
        iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/116.png",
      },
    },
    {
      time: "2026-04-12 17:00",
      temperatureC: 20,
      isDay: true,
      condition: {
        code: 1003,
        label: "מעונן חלקית",
        iconUrl: "https://cdn.weatherapi.com/weather/64x64/day/116.png",
      },
    },
  ],
  observedAt: "2026-04-12 10:00",
};

describe("weather presentation contracts", () => {
  it("preserves service architecture and cache constants", () => {
    expect(WEATHER_FORECAST_DAYS).toBe(3);
    expect(WEATHER_SNAPSHOT_REVALIDATE_SECONDS).toBe(900);
    expect(readSource("features/weather/queries.ts")).toContain("getWeatherSnapshot");
    expect(readSource("features/weather/weatherapi.server.ts")).toContain("forecast.json");
    expect(readSource("features/weather/normalize-weather.ts")).toContain("hour");
  });

  it("builds view-model fields for current weather and forecast rows", () => {
    expect(sampleSnapshot.location.label).toBe("Kyoto");
    expect(sampleSnapshot.current.temperatureC).toBe(18);
    expect(sampleSnapshot.current.condition.label).toBe("מעונן חלקית");
    expect(formatHighLowRange(sampleSnapshot.today.maxTemperatureC, sampleSnapshot.today.minTemperatureC))
      .toContain("22°");
    expect(formatHighLowRange(sampleSnapshot.today.maxTemperatureC, sampleSnapshot.today.minTemperatureC))
      .toContain("12°");

    const days = getWeatherForecastDaysForDisplay(sampleSnapshot);
    expect(days).toHaveLength(3);
    expect(days[0]?.date).toBe("2026-04-12");
    expect(formatForecastRowLabel("2026-04-13")).toMatch(/13/);
  });

  it("exposes near-term hourly columns from normalized hourly data", () => {
    expect(hasHourlyWeatherData(sampleSnapshot)).toBe(true);
    const columns = buildNearTermWeatherColumns(sampleSnapshot);
    expect(columns[0]?.label).toBe("עכשיו");
    expect(columns.length).toBeGreaterThanOrEqual(2);
    expect(shouldShowNearTermStrip(sampleSnapshot)).toBe(true);
  });

  it("derives travel advice deterministically without external calls", () => {
    const advice = buildTravelWeatherAdvice(sampleSnapshot);
    expect(advice.title).toBe("מה כדאי לקחת היום");
    expect(advice.message.length).toBeGreaterThan(0);
    expect(advice.icon).toBeTruthy();
    expect(readSource("features/weather/build-travel-weather-advice.ts")).not.toMatch(/fetch\(/);
  });

  it("uses redesigned layout classes and skeleton loading", () => {
    const pageSource = readSource("features/weather/WeatherPage.client.tsx");
    const scss = readSource("features/weather/WeatherView.module.scss");

    expect(pageSource).toContain("WeatherSkeleton");
    expect(pageSource).toContain("currentHero");
    expect(pageSource).toContain("hourlyStrip");
    expect(pageSource).toContain("adviceCard");
    expect(pageSource).toContain("forecastCard");
    expect(pageSource).toContain("weatherHeader");
    expect(scss).toContain(".weatherBody");
    expect(scss).not.toContain(".currentCard");
    expect(pageSource).not.toMatch(/google.*maps|MapEmbed|leaflet|radar/i);
  });

  it("preserves location search routes and travel hub navigation", () => {
    expect(readSource("features/weather/WeatherLocationSearch.client.tsx")).toContain(
      "buildWeatherSearchHref",
    );
    expect(readSource("features/weather/weather-search.server.ts")).toContain(
      "searchWeatherLocationsViaGooglePlaces",
    );
    expect(readSource("features/travel-hub/constants.ts")).toContain('id: "weather"');
    expect(readSource("features/app-shell/navigation.ts")).toContain("weather");
  });

  it("removes trip meta row from weather route and defines mobile-first layout", () => {
    const pageSource = readSource("app/app/trips/[tripId]/weather/page.tsx");
    const scss = readSource("features/weather/WeatherView.module.scss");

    expect(pageSource).not.toContain("TripHeader");
    expect(pageSource).not.toContain("showTripSwitch");
    expect(scss).toMatch(/@media \(min-width: 1024px\)[\s\S]*grid-template-columns/);
    expect(scss).toContain(".forecastRow");
    expect(scss).toContain(".currentTemp");
    expect(scss).toContain(".hourlyStrip");
  });
});
