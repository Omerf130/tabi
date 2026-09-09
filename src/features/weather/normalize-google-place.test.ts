import { describe, expect, it } from "vitest";
import { normalizeGooglePlaceToWeatherLocation } from "./normalize-google-place";

describe("normalizeGooglePlaceToWeatherLocation", () => {
  it("normalizes geographic Google details into WeatherLocationRef", () => {
    expect(
      normalizeGooglePlaceToWeatherLocation(
        {
          displayName: { text: "חיפה" },
          location: { latitude: 32.794, longitude: 34.9896 },
          types: ["locality", "political"],
          primaryType: "locality",
          addressComponents: [
            { longText: "חיפה", types: ["locality"] },
            { longText: "ישראל", types: ["country"] },
          ],
        },
        { primaryText: "חיפה", secondaryText: "מחוז חיפה, ישראל" },
      ),
    ).toEqual({
      label: "חיפה",
      region: "חיפה",
      country: "ישראל",
      latitude: 32.794,
      longitude: 34.9896,
    });
  });

  it("returns null when coordinates are missing", () => {
    expect(
      normalizeGooglePlaceToWeatherLocation(
        {
          displayName: { text: "חיפה" },
          types: ["locality"],
          addressComponents: [{ longText: "Israel", types: ["country"] }],
        },
        { primaryText: "חיפה" },
      ),
    ).toBeNull();
  });

  it("returns null for irrelevant POI results", () => {
    expect(
      normalizeGooglePlaceToWeatherLocation(
        {
          displayName: { text: "Some Restaurant" },
          location: { latitude: 32.1, longitude: 34.8 },
          types: ["restaurant", "food", "point_of_interest"],
          primaryType: "restaurant",
          addressComponents: [{ longText: "Israel", types: ["country"] }],
        },
        { primaryText: "Some Restaurant" },
      ),
    ).toBeNull();
  });
});
