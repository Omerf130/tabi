import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GooglePlacesConfigError,
  autocompletePlaces,
  resolveSelectedPlace,
} from "./googlePlaces.server";
import {
  PLACES_AUTOCOMPLETE_FIELD_MASK,
  PLACES_DETAILS_FIELD_MASK,
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
    expect(init.headers["X-Goog-FieldMask"]).toBe(PLACES_DETAILS_FIELD_MASK);
  });
});
