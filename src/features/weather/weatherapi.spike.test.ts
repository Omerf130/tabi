import { describe, expect, it } from "vitest";
import {
  fetchWeatherForecast,
  searchWeatherLocations,
} from "./weatherapi.server";

const hasWeatherApiKey = Boolean(process.env.WEATHER_API_KEY?.trim());

describe.runIf(hasWeatherApiKey)("weatherapi live spike", () => {
  it("search.json returns normalized global locations", async () => {
    const results = await searchWeatherLocations("Tokyo");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toEqual(
      expect.objectContaining({
        label: expect.any(String),
        country: expect.any(String),
        latitude: expect.any(Number),
        longitude: expect.any(Number),
      }),
    );
    expect(results[0]).not.toHaveProperty("providerLocationId");
  });

  it("forecast.json?days=3 returns current, today and forecast rain fields", async () => {
    const snapshot = await fetchWeatherForecast({
      label: "Tokyo",
      region: "Tokyo",
      country: "Japan",
      latitude: 35.6895,
      longitude: 139.6917,
    });

    expect(snapshot.current.temperatureC).toEqual(expect.any(Number));
    expect(snapshot.current.feelsLikeC).toEqual(expect.any(Number));
    expect(snapshot.current.condition.label.length).toBeGreaterThan(0);
    expect(snapshot.today.minTemperatureC).toEqual(expect.any(Number));
    expect(snapshot.today.maxTemperatureC).toEqual(expect.any(Number));
    expect(snapshot.forecast.length).toBeGreaterThan(0);
    expect(snapshot.forecast[0]?.chanceOfRainPercent).toEqual(expect.any(Number));
  });
});
