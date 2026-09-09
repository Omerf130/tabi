import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchWeatherForecast,
  searchWeatherLocations,
  WeatherApiRequestError,
} from "./weatherapi.server";

const fetchMock = vi.fn();

describe("weatherapi.server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    process.env.WEATHER_API_KEY = "test-key";
  });

  it("queries forecast by lat/lng coordinates", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temp_c: 20,
          feelslike_c: 21,
          is_day: 1,
          last_updated: "2026-09-09 10:00",
          condition: { code: 1000, text: "Sunny", icon: "//cdn.weatherapi.com/icon.png" },
        },
        forecast: {
          forecastday: [
            {
              date: "2026-09-09",
              day: {
                mintemp_c: 18,
                maxtemp_c: 22,
                daily_chance_of_rain: 5,
                condition: { code: 1000, text: "Sunny", icon: "//cdn.weatherapi.com/icon.png" },
              },
            },
          ],
        },
      }),
    });

    const snapshot = await fetchWeatherForecast({
      label: "Tokyo",
      country: "Japan",
      latitude: 35.6895,
      longitude: 139.6917,
    });

    expect(snapshot.current.temperatureC).toBe(20);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("forecast.json");
    expect(String(url)).toContain("q=35.6895%2C139.6917");
    expect(String(url)).toContain("days=3");
    expect(String(url)).toContain("key=test-key");
    expect(init.next).toEqual({ revalidate: 900 });
    expect(JSON.stringify(snapshot)).not.toContain("test-key");
  });

  it("searches locations and normalizes results", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 123,
          name: "Tokyo",
          region: "Tokyo",
          country: "Japan",
          lat: 35.6895,
          lon: 139.6917,
        },
      ],
    });

    const results = await searchWeatherLocations("tokyo");
    expect(results[0]).toEqual({
      label: "Tokyo",
      region: "Tokyo",
      country: "Japan",
      latitude: 35.6895,
      longitude: 139.6917,
    });
    expect(results[0]).not.toHaveProperty("providerLocationId");

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.next).toEqual({ revalidate: 86_400 });
  });

  it("throws safe provider errors without exposing the API key", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "Invalid key" } }),
    });

    await expect(
      fetchWeatherForecast({
        label: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      }),
    ).rejects.toBeInstanceOf(WeatherApiRequestError);

    try {
      await fetchWeatherForecast({
        label: "Tokyo",
        country: "Japan",
        latitude: 35.6895,
        longitude: 139.6917,
      });
    } catch (error) {
      expect(String(error)).not.toContain("test-key");
    }
  });
});
