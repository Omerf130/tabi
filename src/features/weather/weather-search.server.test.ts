import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchWeatherLocationsWithFallback } from "./weather-search.server";

const {
  searchWeatherLocationsMock,
  searchWeatherLocationsViaGooglePlacesMock,
} = vi.hoisted(() => ({
  searchWeatherLocationsMock: vi.fn(),
  searchWeatherLocationsViaGooglePlacesMock: vi.fn(),
}));

vi.mock("./weatherapi.server", () => ({
  searchWeatherLocations: searchWeatherLocationsMock,
}));

vi.mock("./google-places-fallback.server", () => ({
  searchWeatherLocationsViaGooglePlaces: searchWeatherLocationsViaGooglePlacesMock,
  isGooglePlacesFallbackError: (error: unknown) =>
    error instanceof Error &&
    (error.name === "GooglePlacesConfigError" ||
      error.name === "GooglePlacesRequestError"),
}));

describe("searchWeatherLocationsWithFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns WeatherAPI results without calling Google fallback", async () => {
    searchWeatherLocationsMock.mockResolvedValue([
      {
        label: "Haifa",
        region: "Haifa",
        country: "Israel",
        latitude: 32.794,
        longitude: 34.9896,
      },
    ]);

    const results = await searchWeatherLocationsWithFallback("Haifa");

    expect(results).toHaveLength(1);
    expect(searchWeatherLocationsViaGooglePlacesMock).not.toHaveBeenCalled();
  });

  it("calls Google fallback when WeatherAPI returns no results", async () => {
    searchWeatherLocationsMock.mockResolvedValue([]);
    searchWeatherLocationsViaGooglePlacesMock.mockResolvedValue([
      {
        label: "חיפה",
        region: "Haifa",
        country: "Israel",
        latitude: 32.794,
        longitude: 34.9896,
      },
    ]);

    const results = await searchWeatherLocationsWithFallback("חיפה");

    expect(searchWeatherLocationsViaGooglePlacesMock).toHaveBeenCalledWith("חיפה");
    expect(results[0]?.label).toBe("חיפה");
  });

  it("returns empty results when both providers find nothing", async () => {
    searchWeatherLocationsMock.mockResolvedValue([]);
    searchWeatherLocationsViaGooglePlacesMock.mockResolvedValue([]);

    await expect(searchWeatherLocationsWithFallback("zzzz")).resolves.toEqual([]);
  });

  it("treats Google fallback failure as empty results", async () => {
    searchWeatherLocationsMock.mockResolvedValue([]);
    const error = new Error("Google Places is not configured");
    error.name = "GooglePlacesConfigError";
    searchWeatherLocationsViaGooglePlacesMock.mockRejectedValue(error);

    await expect(searchWeatherLocationsWithFallback("חיפה")).resolves.toEqual([]);
  });
});
