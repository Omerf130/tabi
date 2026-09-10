import { describe, expect, it } from "vitest";
import { isCompactPlaceImagePresentation } from "./place-image-presentation";

describe("place image presentation", () => {
  it("identifies compact presentation mode", () => {
    expect(isCompactPlaceImagePresentation("compact")).toBe(true);
    expect(isCompactPlaceImagePresentation("default")).toBe(false);
  });
});
