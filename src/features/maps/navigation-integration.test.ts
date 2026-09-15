import { describe, expect, it } from "vitest";
import {
  buildAccommodationNavigationHref,
  buildActivityNavigationHref,
} from "@/lib/maps/navigation-entities";
import type { ActivityViewModel } from "@/features/itinerary/types";

const baseActivity = (
  overrides: Partial<ActivityViewModel> = {},
): ActivityViewModel => ({
  id: "a1",
  date: "2026-01-01",
  title: "Visit",
  type: "attraction",
  typeLabel: "Attraction",
  order: 0,
  placeSource: "google",
  ...overrides,
});

describe("navigation integration", () => {
  it("Activity: lat/lng without googleMapsUrl can navigate with waze", () => {
    const href = buildActivityNavigationHref(
      baseActivity({
        latitude: 35.6762,
        longitude: 139.6503,
      }),
      "waze",
    );
    expect(href).toContain("waze.com");
  });

  it("Activity: Google uses persisted googleMapsUrl when safe", () => {
    const href = buildActivityNavigationHref(
      baseActivity({
        googleMapsUrl: "https://maps.google.com/?cid=99",
        latitude: 1,
        longitude: 2,
      }),
      "google",
    );
    expect(href).toBe("https://maps.google.com/?cid=99");
  });

  it("Activity: Apple preference produces Apple URL", () => {
    const href = buildActivityNavigationHref(
      baseActivity({ address: "Kyoto" }),
      "apple",
    );
    expect(href).toContain("maps.apple.com");
  });

  it("Accommodation: Waze uses address without API", () => {
    const href = buildAccommodationNavigationHref(
      {
        name: "Hotel",
        addressEnglish: "1-2-3 Shinjuku",
        googleMapsUrl: "https://maps.google.com/?cid=1",
      },
      "waze",
    );
    expect(href).toContain("waze.com");
    expect(href).not.toContain("google");
  });

  it("Accommodation: Google uses existing Google URL when available", () => {
    const href = buildAccommodationNavigationHref(
      {
        name: "Hotel",
        addressEnglish: "Tokyo",
        googleMapsUrl: "https://maps.google.com/?cid=55",
      },
      "google",
    );
    expect(href).toBe("https://maps.google.com/?cid=55");
  });
});
