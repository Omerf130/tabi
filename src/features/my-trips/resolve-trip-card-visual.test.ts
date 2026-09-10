import { describe, expect, it } from "vitest";
import { MY_TRIPS_FALLBACK_VISUAL } from "./constants";
import { resolveTripCardVisual } from "./resolve-trip-card-visual";

describe("resolveTripCardVisual", () => {
  it("uses the secure trip cover route when a cover exists", () => {
    expect(
      resolveTripCardVisual("507f1f77bcf86cd799439011", true, "japan-01"),
    ).toEqual({
      imageSrc: "/app/trips/507f1f77bcf86cd799439011/cover",
      hasPersistedCover: true,
    });
  });

  it("uses persisted coverVisualKey before neutral fallback", () => {
    expect(
      resolveTripCardVisual("507f1f77bcf86cd799439011", false, "japan-01"),
    ).toEqual({
      imageSrc: "/destination-visuals/japan.png",
      hasPersistedCover: false,
    });
  });

  it("uses the fixed neutral fallback when no cover exists", () => {
    expect(resolveTripCardVisual("507f1f77bcf86cd799439011", false)).toEqual({
      imageSrc: MY_TRIPS_FALLBACK_VISUAL,
      hasPersistedCover: false,
    });
  });

  it("returns the same fallback for the same trip on repeated calls", () => {
    const first = resolveTripCardVisual("507f1f77bcf86cd799439011", false);
    const second = resolveTripCardVisual("507f1f77bcf86cd799439011", false);
    expect(first).toEqual(second);
  });
});
