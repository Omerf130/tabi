import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchPlaceGeographyDetailsMock } = vi.hoisted(() => ({
  fetchPlaceGeographyDetailsMock: vi.fn(),
}));

vi.mock("./googlePlaces.server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./googlePlaces.server")>();
  return {
    ...actual,
    fetchPlaceGeographyDetails: fetchPlaceGeographyDetailsMock,
  };
});

import { GooglePlacesRequestError } from "./googlePlaces.server";
import { resolveDestinationSnapshot } from "./resolve-destination-snapshot";

describe("resolveDestinationSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a canonical geographic snapshot", async () => {
    fetchPlaceGeographyDetailsMock.mockResolvedValue({
      displayName: { text: "Tokyo" },
      formattedAddress: "Tokyo, Japan",
      addressComponents: [
        { longText: "Japan", shortText: "JP", types: ["country"] },
        { longText: "Tokyo", shortText: "Tokyo", types: ["locality"] },
      ],
      location: { latitude: 35.6762, longitude: 139.6503 },
      types: ["locality"],
      primaryType: "locality",
    });

    await expect(
      resolveDestinationSnapshot("place-tokyo", {
        primaryText: "Tokyo",
        secondaryText: "Japan",
      }),
    ).resolves.toEqual({
      googlePlaceId: "place-tokyo",
      displayName: "Tokyo",
      secondaryLabel: "Tokyo, Japan",
      country: "Japan",
      countryCode: "JP",
      latitude: 35.6762,
      longitude: 139.6503,
    });
  });

  it("rejects non-geographic places", async () => {
    fetchPlaceGeographyDetailsMock.mockResolvedValue({
      displayName: { text: "Hotel Example" },
      location: { latitude: 35.6, longitude: 139.7 },
      types: ["lodging"],
      primaryType: "lodging",
    });

    await expect(resolveDestinationSnapshot("place-hotel")).rejects.toBeInstanceOf(
      GooglePlacesRequestError,
    );
  });
});
