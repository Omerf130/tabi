import { describe, expect, it } from "vitest";
import { NEUTRAL_FALLBACK_VISUAL_SRC } from "./registry";
import { resolveTripVisualSrc } from "./resolve-trip-visual-src";

describe("resolveTripVisualSrc", () => {
  it("prefers user coverImage", () => {
    expect(
      resolveTripVisualSrc({
        hasCoverImage: true,
        tripId: "507f1f77bcf86cd799439011",
        coverVisualKey: "japan-01",
      }),
    ).toEqual({
      imageSrc: "/app/trips/507f1f77bcf86cd799439011/cover",
      hasPersistedCover: true,
    });
  });

  it("uses persisted coverVisualKey when no uploaded cover", () => {
    expect(
      resolveTripVisualSrc({
        hasCoverImage: false,
        tripId: "507f1f77bcf86cd799439011",
        coverVisualKey: "europe-03",
      }),
    ).toEqual({
      imageSrc: "/destination-visuals/europe03.png",
      hasPersistedCover: false,
    });
  });

  it("falls back to neutral homeApp when legacy trip has no visual key", () => {
    expect(
      resolveTripVisualSrc({
        hasCoverImage: false,
        tripId: "507f1f77bcf86cd799439011",
      }),
    ).toEqual({
      imageSrc: NEUTRAL_FALLBACK_VISUAL_SRC,
      hasPersistedCover: false,
    });
  });
});
