import { describe, expect, it } from "vitest";
import { shouldActivityUsePlaceImage } from "./should-activity-use-place-image";

describe("shouldActivityUsePlaceImage", () => {
  it("allows place imagery for eligible google-backed activities", () => {
    expect(
      shouldActivityUsePlaceImage({
        type: "attraction",
        placeSource: "google",
        googlePlaceId: "place-1",
      }),
    ).toBe(true);
  });

  it("rejects transport-like and manual activities", () => {
    expect(
      shouldActivityUsePlaceImage({
        type: "transport",
        placeSource: "google",
        googlePlaceId: "place-1",
      }),
    ).toBe(false);

    expect(
      shouldActivityUsePlaceImage({
        type: "restaurant",
        placeSource: "manual",
      }),
    ).toBe(false);
  });
});
