import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PLACE_PHOTO_DETAILS_FIELD_MASK,
  PLACE_PHOTO_RESPONSE_CACHE_CONTROL,
} from "./constants";
import { fetchPlacePhotoMetadata, fetchPlacePhotoMedia } from "./google-place-photos.server";
import { getPlacePhotoMetadata } from "./get-place-photo-metadata";
import { getPlacePhotoPresentation } from "./get-place-photo-presentation";
import { createPlacePhotoRequestContext } from "./request-dedupe";
import { servePlacePhotoResponse } from "./serve-place-photo";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("place-images foundation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
  });

  it("selects photos[0] as the representative photo", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        photos: [
          {
            name: "places/ChIJTest/photos/primary",
            authorAttributions: [{ displayName: "Primary Author", uri: "//maps.google.com/a" }],
          },
          { name: "places/ChIJTest/photos/secondary" },
        ],
      }),
    });

    const metadata = await fetchPlacePhotoMetadata("ChIJTest");

    expect(metadata).toEqual({
      googlePlaceId: "ChIJTest",
      photoName: "places/ChIJTest/photos/primary",
      authorAttributions: [{ displayName: "Primary Author", uri: "//maps.google.com/a" }],
    });
  });

  it("dedupes metadata lookups within one request context", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        photos: [{ name: "places/ChIJTest/photos/primary" }],
      }),
    });

    const context = createPlacePhotoRequestContext();
    const first = await getPlacePhotoMetadata("ChIJTest", context);
    const second = await getPlacePhotoMetadata("ChIJTest", context);

    expect(first).toEqual(second);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("carries attribution into presentation data", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        photos: [
          {
            name: "places/ChIJTest/photos/primary",
            authorAttributions: [{ displayName: "Jane Doe", uri: "//maps.google.com/jane" }],
          },
        ],
      }),
    });

    const presentation = await getPlacePhotoPresentation({
      googlePlaceId: "ChIJTest",
      photoHref: "/app/trips/trip/activities/act/photo",
    });

    expect(presentation).toEqual({
      hasPhoto: true,
      photoHref: "/app/trips/trip/activities/act/photo",
      authorAttributions: [{ displayName: "Jane Doe", uri: "//maps.google.com/jane" }],
    });
  });

  it("returns fallback-compatible presentation when photo metadata is missing", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ photos: [] }),
    });

    const presentation = await getPlacePhotoPresentation({
      googlePlaceId: "ChIJTest",
      photoHref: "/app/trips/trip/activities/act/photo",
    });

    expect(presentation).toEqual({
      hasPhoto: false,
      authorAttributions: [],
    });
  });

  it("keeps the Google API key on server requests only", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        photos: [{ name: "places/ChIJTest/photos/primary" }],
      }),
    });

    const metadata = await fetchPlacePhotoMetadata("ChIJTest");

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.headers["X-Goog-Api-Key"]).toBe("test-key");
    expect(JSON.stringify(metadata)).not.toContain("test-key");
  });

  it("uses photos-only Place Details field mask", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ photos: [] }),
    });

    await fetchPlacePhotoMetadata("ChIJTest");

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.headers["X-Goog-FieldMask"]).toBe(PLACE_PHOTO_DETAILS_FIELD_MASK);
    expect(PLACE_PHOTO_DETAILS_FIELD_MASK).toBe("photos");
  });

  it("serves media with conservative cache headers", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [{ name: "places/ChIJTest/photos/primary" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
      });

    const response = await servePlacePhotoResponse({
      googlePlaceId: "ChIJTest",
      userId: "user-1",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(PLACE_PHOTO_RESPONSE_CACHE_CONTROL);
  });

  it("falls back on quota failures with 404", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [{ name: "places/ChIJTest/photos/primary" }],
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 403 });

    const response = await servePlacePhotoResponse({
      googlePlaceId: "ChIJTest",
      userId: "user-2",
    });

    expect(response.status).toBe(404);
  });

  it("returns 429 when media fetch is rate limited", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [{ name: "places/ChIJTest/photos/primary" }],
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 429 });

    const response = await servePlacePhotoResponse({
      googlePlaceId: "ChIJTest",
      userId: "user-3",
    });

    expect(response.status).toBe(429);
  });

  it("retries once with fresh metadata when photo name expires", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [{ name: "places/ChIJTest/photos/stale" }],
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          photos: [{ name: "places/ChIJTest/photos/fresh" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "image/jpeg" },
        arrayBuffer: async () => new Uint8Array([9]).buffer,
      });

    const response = await servePlacePhotoResponse({
      googlePlaceId: "ChIJTest",
      userId: "user-4",
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("includes API key only on server media fetch URL", async () => {
    await fetchPlacePhotoMedia("places/ChIJTest/photos/primary");

    const [url] = fetchMock.mock.calls.at(-1)!;
    expect(String(url)).toContain("key=test-key");
    expect(String(url)).toContain("/media");
  });
});
