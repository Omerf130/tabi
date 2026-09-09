import { beforeEach, describe, expect, it, vi } from "vitest";
import { WEATHER_PLACES_SEARCH_LANGUAGE_CODE } from "./constants";
import { searchWeatherLocationsViaGooglePlaces } from "./google-places-fallback.server";

const {
  autocompleteGeographicPlacesMock,
  fetchPlaceGeographyDetailsMock,
  createPlaceSessionTokenMock,
} = vi.hoisted(() => ({
  autocompleteGeographicPlacesMock: vi.fn(),
  fetchPlaceGeographyDetailsMock: vi.fn(),
  createPlaceSessionTokenMock: vi.fn(),
}));

vi.mock("@/features/places/googlePlaces.server", () => ({
  GooglePlacesConfigError: class GooglePlacesConfigError extends Error {
    name = "GooglePlacesConfigError";
  },
  GooglePlacesRequestError: class GooglePlacesRequestError extends Error {
    name = "GooglePlacesRequestError";
  },
  autocompleteGeographicPlaces: autocompleteGeographicPlacesMock,
  fetchPlaceGeographyDetails: fetchPlaceGeographyDetailsMock,
}));

vi.mock("@/features/places/placeSession", () => ({
  createPlaceSessionToken: createPlaceSessionTokenMock,
}));

describe("searchWeatherLocationsViaGooglePlaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createPlaceSessionTokenMock.mockReturnValue("11111111-1111-4111-8111-111111111111");
  });

  it("requests Hebrew localization for autocomplete and details", async () => {
    autocompleteGeographicPlacesMock.mockResolvedValue([
      {
        placeId: "ChIJHaifa",
        primaryText: "חיפה",
        secondaryText: "מחוז חיפה, ישראל",
      },
    ]);
    fetchPlaceGeographyDetailsMock.mockResolvedValue({
      displayName: { text: "חיפה" },
      location: { latitude: 32.794, longitude: 34.9896 },
      types: ["locality", "political"],
      primaryType: "locality",
      addressComponents: [
        { longText: "חיפה", types: ["locality"] },
        { longText: "ישראל", types: ["country"] },
      ],
    });

    const results = await searchWeatherLocationsViaGooglePlaces("חיפה");

    expect(autocompleteGeographicPlacesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "חיפה",
        languageCode: WEATHER_PLACES_SEARCH_LANGUAGE_CODE,
      }),
    );
    expect(fetchPlaceGeographyDetailsMock).toHaveBeenCalledWith(
      "ChIJHaifa",
      expect.objectContaining({
        sessionToken: "11111111-1111-4111-8111-111111111111",
        languageCode: WEATHER_PLACES_SEARCH_LANGUAGE_CODE,
      }),
    );
    expect(results[0]).toEqual({
      label: "חיפה",
      region: "חיפה",
      country: "ישראל",
      latitude: 32.794,
      longitude: 34.9896,
    });
    expect(JSON.stringify(results)).not.toContain("11111111-1111-4111-8111-111111111111");
  });

  it("normalizes Hebrew-localized Tokyo results without Japanese labels", async () => {
    autocompleteGeographicPlacesMock.mockResolvedValue([
      {
        placeId: "ChIJTokyo",
        primaryText: "טוקיו",
        secondaryText: "טוקיו, יפן",
      },
    ]);
    fetchPlaceGeographyDetailsMock.mockResolvedValue({
      displayName: { text: "טוקיו" },
      location: { latitude: 35.6895, longitude: 139.6917 },
      types: ["locality", "political"],
      primaryType: "locality",
      addressComponents: [
        { longText: "טוקיו", types: ["locality"] },
        { longText: "יפן", types: ["country"] },
      ],
    });

    const results = await searchWeatherLocationsViaGooglePlaces("טוקיו");

    expect(results[0]).toEqual({
      label: "טוקיו",
      region: "טוקיו",
      country: "יפן",
      latitude: 35.6895,
      longitude: 139.6917,
    });
    expect(results[0]?.label).not.toMatch(/[\u3040-\u30FF]/);
  });

  it("filters out irrelevant POI suggestions", async () => {
    autocompleteGeographicPlacesMock.mockResolvedValue([
      {
        placeId: "ChIJRestaurant",
        primaryText: "Some Restaurant",
        secondaryText: "Haifa, Israel",
      },
    ]);
    fetchPlaceGeographyDetailsMock.mockResolvedValue({
      displayName: { text: "Some Restaurant" },
      location: { latitude: 32.794, longitude: 34.9896 },
      types: ["restaurant", "food", "point_of_interest"],
      primaryType: "restaurant",
      addressComponents: [{ longText: "ישראל", types: ["country"] }],
    });

    await expect(searchWeatherLocationsViaGooglePlaces("חיפה")).resolves.toEqual([]);
  });
});
