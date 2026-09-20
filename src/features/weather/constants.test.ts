import { describe, expect, it } from "vitest";
import {
  buildWeatherHref,
  buildWeatherPreferenceKey,
  buildWeatherSnapshotHref,
} from "./constants";
import type { WeatherLocationRef } from "./types";

const tripId = "507f1f77bcf86cd799439011";

const sampleLocation: WeatherLocationRef = {
  label: "Rome",
  country: "Italy",
  latitude: 41.9028,
  longitude: 12.4964,
};

describe("weather constants", () => {
  it("scopes weather preference keys by trip", () => {
    expect(buildWeatherPreferenceKey(tripId)).toBe(`tabi.weather.v1.location.${tripId}`);
  });

  it("builds weather hrefs", () => {
    expect(buildWeatherHref(tripId)).toBe(`/app/trips/${tripId}/weather`);
    expect(buildWeatherSnapshotHref(tripId, sampleLocation)).toContain("latitude=41.9028");
    expect(buildWeatherSnapshotHref(tripId, sampleLocation)).toContain("label=Rome");
    expect(buildWeatherSnapshotHref(tripId, sampleLocation)).not.toContain("providerLocationId");
  });
});
