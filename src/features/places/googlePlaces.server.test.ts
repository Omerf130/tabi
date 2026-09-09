import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GooglePlacesConfigError,
  autocompleteGeographicPlaces,
  autocompletePlaces,
  fetchPlaceGeographyDetails,
  resolveSelectedPlace,
} from "./googlePlaces.server";
import {
  PLACES_AUTOCOMPLETE_FIELD_MASK,
  PLACES_DETAILS_FIELD_MASK,
  PLACES_DETAILS_GEOGRAPHY_FIELD_MASK,
  PLACES_DISPLAY_LANGUAGE_CODE,
  PLACES_GEOGRAPHIC_PRIMARY_TYPES,
  PLACES_INCLUDED_REGION_CODES,
  PLACES_LODGING_PRIMARY_TYPES,
  PLACES_SEARCH_LANGUAGE_CODE,
} from "./constants";
import { clearPlaceDisplayCacheForTests } from "./placeDisplayCache";
import { resetPlacesRateLimitForTests } from "./rateLimit";

const fetchMock = vi.fn();

describe("googlePlaces.server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearPlaceDisplayCacheForTests();
    resetPlacesRateLimitForTests();
    vi.stubGlobal("fetch", fetchMock);
    process.env.GOOGLE_PLACES_API_KEY = "test-key";
  });

  it("throws when api key is missing", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;
    await expect(
      autocompletePlaces({ query: "hotel", sessionToken: crypto.randomUUID() }),
    ).rejects.toBeInstanceOf(GooglePlacesConfigError);
  });

  it("normalizes autocomplete suggestions with japan lodging config", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        suggestions: [
          {
            placePrediction: {
              placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
              structuredFormat: {
                mainText: { text: "Hotel Gracery Shinjuku" },
                secondaryText: { text: "Shinjuku, Tokyo" },
              },
            },
          },
        ],
      }),
    });

    const suggestions = await autocompletePlaces({
      query: "gracery",
      sessionToken: "11111111-1111-4111-8111-111111111111",
    });

    expect(suggestions).toEqual([
      {
        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        primaryText: "Hotel Gracery Shinjuku",
        secondaryText: "Shinjuku, Tokyo",
      },
    ]);

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("POST");
    expect(init.headers["X-Goog-FieldMask"]).toBe(PLACES_AUTOCOMPLETE_FIELD_MASK);
    expect(init.headers["X-Goog-Api-Key"]).toBe("test-key");
    const body = JSON.parse(String(init.body));
    expect(body.includedRegionCodes).toEqual([...PLACES_INCLUDED_REGION_CODES]);
    expect(body.includedPrimaryTypes).toEqual([...PLACES_LODGING_PRIMARY_TYPES]);
    expect(body.languageCode).toBe(PLACES_SEARCH_LANGUAGE_CODE);
    expect(JSON.stringify(body)).not.toContain("test-key");
  });

  it("autocomplete geographic places with explicit caller language", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        suggestions: [
          {
            placePrediction: {
              placeId: "ChIJHaifa",
              structuredFormat: {
                mainText: { text: "חיפה" },
                secondaryText: { text: "מחוז חיפה, ישראל" },
              },
            },
          },
        ],
      }),
    });

    const suggestions = await autocompleteGeographicPlaces({
      query: "חיפה",
      sessionToken: "11111111-1111-4111-8111-111111111111",
      languageCode: "he",
    });

    expect(suggestions).toEqual([
      {
        placeId: "ChIJHaifa",
        primaryText: "חיפה",
        secondaryText: "מחוז חיפה, ישראל",
      },
    ]);

    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(String(init.body));
    expect(body.includedPrimaryTypes).toEqual([...PLACES_GEOGRAPHIC_PRIMARY_TYPES]);
    expect(body.languageCode).toBe("he");
    expect(body.includedRegionCodes).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("test-key");
  });

  it("defaults geographic autocomplete to English when language is omitted", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: [] }),
    });

    await autocompleteGeographicPlaces({
      query: "London",
      sessionToken: "11111111-1111-4111-8111-111111111111",
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(String(init.body));
    expect(body.languageCode).toBe(PLACES_SEARCH_LANGUAGE_CODE);
    expect(body.languageCode).not.toBe(PLACES_DISPLAY_LANGUAGE_CODE);
  });

  it("fetches geography details with caller-provided Hebrew localization", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "ChIJHaifa",
        displayName: { text: "חיפה" },
        location: { latitude: 32.794, longitude: 34.9896 },
        types: ["locality", "political"],
        primaryType: "locality",
        addressComponents: [{ longText: "ישראל", types: ["country"] }],
      }),
    });

    const details = await fetchPlaceGeographyDetails("ChIJHaifa", {
      languageCode: "he",
    });

    expect(details.displayName?.text).toBe("חיפה");
    expect(details.location).toEqual({ latitude: 32.794, longitude: 34.9896 });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("languageCode=he");
    expect(init.headers["X-Goog-FieldMask"]).toBe(PLACES_DETAILS_GEOGRAPHY_FIELD_MASK);
    expect(JSON.stringify(details)).not.toContain("test-key");
  });

  it("resolves selected place with one terminating details request", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
        displayName: { text: "ホテルグレイスリー新宿" },
        formattedAddress: "東京都新宿区歌舞伎町1-19-1",
        googleMapsUri: "https://maps.google.com/?cid=123",
        addressComponents: [{ longText: "Tokyo", types: ["locality"] }],
      }),
    });

    const preview = await resolveSelectedPlace({
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      sessionToken: "11111111-1111-4111-8111-111111111111",
      primaryText: "Hotel Gracery Shinjuku",
      secondaryText: "Shinjuku, Tokyo",
    });

    expect(preview.placeId).toBe("ChIJN1t_tDeuEmsRUsoyG83frY4");
    expect(preview.primaryText).toBe("Hotel Gracery Shinjuku");
    expect(preview.displayNameJapanese).toBe("ホテルグレイスリー新宿");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("ChIJN1t_tDeuEmsRUsoyG83frY4");
    expect(String(url)).toContain("sessionToken=");
    expect(String(url)).toContain(`languageCode=${PLACES_DISPLAY_LANGUAGE_CODE}`);
    expect(init.headers["X-Goog-FieldMask"]).toBe(PLACES_DETAILS_FIELD_MASK);
  });
});
