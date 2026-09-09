import { describe, expect, it } from "vitest";
import {
  buildLocationQuery,
  normalizeIconUrl,
  normalizeSearchResult,
  normalizeWeatherSnapshot,
  type WeatherApiForecastResponse,
} from "./normalize-weather";

const samplePayload: WeatherApiForecastResponse = {
  current: {
    temp_c: 24,
    feelslike_c: 26,
    is_day: 1,
    last_updated: "2026-09-09 12:00",
    condition: {
      code: 1000,
      text: "Sunny",
      icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
    },
  },
  forecast: {
    forecastday: [
      {
        date: "2026-09-09",
        day: {
          mintemp_c: 20,
          maxtemp_c: 28,
          daily_chance_of_rain: 10,
          condition: { code: 1000, text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" },
        },
      },
      {
        date: "2026-09-10",
        day: {
          mintemp_c: 19,
          maxtemp_c: 27,
          daily_chance_of_rain: 40,
          condition: { code: 1003, text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" },
        },
      },
      {
        date: "2026-09-11",
        day: {
          mintemp_c: 18,
          maxtemp_c: 25,
          daily_chance_of_rain: 60,
          condition: { code: 1180, text: "Patchy rain possible", icon: "//cdn.weatherapi.com/weather/64x64/day/176.png" },
        },
      },
    ],
  },
};

const tokyoLocation = {
  label: "Tokyo",
  region: "Tokyo",
  country: "Japan",
  latitude: 35.6895,
  longitude: 139.6917,
};

describe("normalizeWeatherSnapshot", () => {
  it("normalizes a 3-day forecast without provider location IDs", () => {
    const snapshot = normalizeWeatherSnapshot(samplePayload, tokyoLocation);

    expect(snapshot.location).toEqual(tokyoLocation);
    expect(snapshot.current.temperatureC).toBe(24);
    expect(snapshot.current.feelsLikeC).toBe(26);
    expect(snapshot.current.condition.label).toBe("בהיר");
    expect(snapshot.today.maxTemperatureC).toBe(28);
    expect(snapshot.forecast).toHaveLength(2);
    expect(snapshot.forecast[0]?.chanceOfRainPercent).toBe(40);
  });

  it("builds provider query from coordinates only", () => {
    expect(buildLocationQuery(tokyoLocation)).toBe("35.6895,139.6917");
  });

  it("normalizes icon URLs to https", () => {
    expect(normalizeIconUrl("//cdn.weatherapi.com/weather/64x64/day/113.png")).toBe(
      "https://cdn.weatherapi.com/weather/64x64/day/113.png",
    );
  });

  it("normalizes search results into WeatherLocationRef", () => {
    expect(
      normalizeSearchResult({
        id: 999,
        name: "Tokyo",
        region: "Tokyo",
        country: "Japan",
        lat: 35.6895,
        lon: 139.6917,
      }),
    ).toEqual(tokyoLocation);
  });
});
