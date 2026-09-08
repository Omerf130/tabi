import { describe, expect, it } from "vitest";
import {
  createPlaceSessionToken,
  isValidGooglePlaceId,
  isValidPlaceSessionToken,
} from "./placeSession";

describe("placeSession", () => {
  it("creates valid uuid v4 session tokens", () => {
    const token = createPlaceSessionToken();
    expect(isValidPlaceSessionToken(token)).toBe(true);
  });

  it("validates google place ids", () => {
    expect(isValidGooglePlaceId("ChIJN1t_tDeuEmsRUsoyG83frY4")).toBe(true);
    expect(isValidGooglePlaceId("bad")).toBe(false);
  });
});
