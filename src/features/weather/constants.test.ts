import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEATHER_LOCATION,
  WEATHER_FORECAST_DAYS,
  WEATHER_PLACES_SEARCH_LANGUAGE_CODE,
  WEATHER_SEARCH_MIN_INPUT_LENGTH,
  WEATHER_SNAPSHOT_REVALIDATE_SECONDS,
  WEATHER_SEARCH_REVALIDATE_SECONDS,
  buildWeatherHref,
  buildWeatherSnapshotHref,
} from "./constants";

const tripId = "507f1f77bcf86cd799439011";

describe("weather constants", () => {
  it("uses coordinate-based Tokyo default without provider IDs", () => {
    expect(DEFAULT_WEATHER_LOCATION).toEqual({
      label: "Tokyo",
      region: "Tokyo",
      country: "Japan",
      latitude: 35.6895,
      longitude: 139.6917,
    });
    expect(DEFAULT_WEATHER_LOCATION).not.toHaveProperty("providerLocationId");
  });

  it("uses approved cache durations and forecast scope", () => {
    expect(WEATHER_SNAPSHOT_REVALIDATE_SECONDS).toBe(900);
    expect(WEATHER_SEARCH_REVALIDATE_SECONDS).toBe(86_400);
    expect(WEATHER_FORECAST_DAYS).toBe(3);
    expect(WEATHER_SEARCH_MIN_INPUT_LENGTH).toBe(3);
    expect(WEATHER_PLACES_SEARCH_LANGUAGE_CODE).toBe("he");
  });

  it("builds coordinate-based snapshot hrefs", () => {
    expect(buildWeatherHref(tripId)).toBe(`/app/trips/${tripId}/weather`);
    expect(buildWeatherSnapshotHref(tripId, DEFAULT_WEATHER_LOCATION)).toContain(
      "latitude=35.6895",
    );
    expect(buildWeatherSnapshotHref(tripId, DEFAULT_WEATHER_LOCATION)).toContain(
      "longitude=139.6917",
    );
    expect(buildWeatherSnapshotHref(tripId, DEFAULT_WEATHER_LOCATION)).not.toContain(
      "providerLocationId",
    );
  });
});
