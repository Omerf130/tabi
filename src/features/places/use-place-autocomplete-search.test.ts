import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PLACES_AUTOCOMPLETE_DEBOUNCE_MS,
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
  PLACES_LODGING_PRIMARY_TYPES,
} from "./constants";
import { shouldApplyAutocompleteResponse } from "./place-autocomplete-race";
import { fetchPlaceAutocompleteSuggestions } from "./use-place-autocomplete-search";
import { placesAutocompleteRequestSchema } from "./schemas";

const fetchMock = vi.fn();

describe("fetchPlaceAutocompleteSuggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("posts trip query and session token", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        suggestions: [
          {
            placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
            primaryText: "Hotel Gracery Shinjuku",
            secondaryText: "Shinjuku, Tokyo",
          },
        ],
      }),
    });

    const result = await fetchPlaceAutocompleteSuggestions({
      tripId: "507f1f77bcf86cd799439011",
      query: "gracery",
      sessionToken: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.ok).toBe(true);
    expect(result.suggestions).toHaveLength(1);
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body));
    expect(body.tripId).toBe("507f1f77bcf86cd799439011");
    expect(body.input).toBe("gracery");
    expect(body.sessionToken).toBe("11111111-1111-4111-8111-111111111111");
    expect(body.includedPrimaryTypes).toBeUndefined();
  });

  it("passes empty includedPrimaryTypes for activity POI search", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ suggestions: [] }),
    });

    await fetchPlaceAutocompleteSuggestions({
      tripId: "507f1f77bcf86cd799439011",
      query: "museum",
      sessionToken: "11111111-1111-4111-8111-111111111111",
      includedPrimaryTypes: [],
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(String(init.body));
    expect(body.includedPrimaryTypes).toEqual([]);
  });

  it("passes includedPrimaryTypes when provided", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ suggestions: [] }),
    });

    await fetchPlaceAutocompleteSuggestions({
      tripId: "507f1f77bcf86cd799439011",
      query: "museum",
      sessionToken: "11111111-1111-4111-8111-111111111111",
      includedPrimaryTypes: ["tourist_attraction"],
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const body = JSON.parse(String(init.body));
    expect(body.includedPrimaryTypes).toEqual(["tourist_attraction"]);
  });

  it("forwards abort signal", async () => {
    const controller = new AbortController();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ suggestions: [] }),
    });

    await fetchPlaceAutocompleteSuggestions(
      {
        tripId: "507f1f77bcf86cd799439011",
        query: "tokyo",
        sessionToken: "11111111-1111-4111-8111-111111111111",
      },
      controller.signal,
    );

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.signal).toBe(controller.signal);
  });
});

describe("places autocomplete search foundation", () => {
  it("keeps debounce and minimum input length constants", () => {
    expect(PLACES_AUTOCOMPLETE_DEBOUNCE_MS).toBe(300);
    expect(PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH).toBe(3);
  });

  it("validates optional includedPrimaryTypes in request schema", () => {
    const withoutTypes = placesAutocompleteRequestSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      input: "tok",
      sessionToken: "11111111-1111-4111-8111-111111111111",
    });
    expect(withoutTypes.success).toBe(true);

    const withTypes = placesAutocompleteRequestSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      input: "tok",
      sessionToken: "11111111-1111-4111-8111-111111111111",
      includedPrimaryTypes: ["tourist_attraction"],
    });
    expect(withTypes.success).toBe(true);

    const belowMinLength = placesAutocompleteRequestSchema.safeParse({
      tripId: "507f1f77bcf86cd799439011",
      input: "to",
      sessionToken: "11111111-1111-4111-8111-111111111111",
    });
    expect(belowMinLength.success).toBe(false);
  });

  it("preserves accommodation lodging defaults on server when types omitted", () => {
    expect(PLACES_LODGING_PRIMARY_TYPES).toEqual(["lodging"]);
  });

  it("protects against stale autocomplete responses", () => {
    expect(shouldApplyAutocompleteResponse(1, 3)).toBe(false);
    expect(shouldApplyAutocompleteResponse(3, 3)).toBe(true);
  });
});

describe("PlaceSearchField focus behavior", () => {
  it("does not disable the input during loading", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/features/places/PlaceSearchField.tsx"),
      "utf8",
    );

    expect(source).not.toContain("disabled={disabled || isPending}");
    expect(source).not.toContain("useTransition");
    expect(source).toMatch(/disabled=\{disabled\}/);
    expect(source).toContain("usePlaceAutocompleteSearch");
  });

  it("uses visual-only loading indicator", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/features/places/PlaceSearchField.tsx"),
      "utf8",
    );

    expect(source).toContain("loadingIndicator");
    expect(source).toContain("aria-busy={isLoading");
  });
});

describe("TripAccommodationSettings manual fallback", () => {
  it("keeps manual accommodation fallback toggle", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/features/accommodations/TripAccommodationSettings.tsx"),
      "utf8",
    );

    expect(source).toContain("לא מצאת את המקום? הזנה ידנית");
    expect(source).toContain("ManualFields");
    expect(source).toContain("setManualMode(true)");
  });
});
