import { describe, expect, it, vi } from "vitest";
import { resolveAccommodationIdentity } from "./resolve-accommodation-identity";

vi.mock("@/features/places/googlePlaces.server", () => ({
  getPlaceDisplayForTraveler: vi.fn(),
}));

import { getPlaceDisplayForTraveler } from "@/features/places/googlePlaces.server";

describe("resolveAccommodationIdentity", () => {
  it("uses legacy manual fields when placeSource is absent", async () => {
    const identity = await resolveAccommodationIdentity({
      _id: { toString: () => "1" },
      tripId: { toString: () => "trip" },
      name: "Legacy Hotel",
      city: "Tokyo",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-28",
    });

    expect(identity.placeSource).toBe("manual");
    expect(identity.name).toBe("Legacy Hotel");
    expect(identity.city).toBe("Tokyo");
    expect(identity.usesGoogleAttribution).toBe(false);
  });

  it("resolves google-backed identity at read time", async () => {
    vi.mocked(getPlaceDisplayForTraveler).mockResolvedValue({
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      name: "Hotel Gracery Shinjuku",
      nameJapanese: "ホテルグレイスリー新宿",
      city: "Tokyo",
      addressJapanese: "東京都新宿区歌舞伎町1-19-1",
      googleMapsUrl: "https://maps.google.com/?cid=123",
    });

    const identity = await resolveAccommodationIdentity({
      _id: { toString: () => "1" },
      tripId: { toString: () => "trip" },
      placeSource: "google",
      googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      checkInDate: "2026-10-25",
      checkOutDate: "2026-10-28",
    });

    expect(identity.placeSource).toBe("google");
    expect(identity.nameJapanese).toBe("ホテルグレイスリー新宿");
    expect(identity.usesGoogleAttribution).toBe(true);
  });
});
