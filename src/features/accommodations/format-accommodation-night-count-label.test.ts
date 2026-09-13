import { describe, expect, it } from "vitest";
import { formatAccommodationNightCountLabel } from "./format-accommodation-night-count-label";

describe("formatAccommodationNightCountLabel", () => {
  it("uses singular Hebrew for one night", () => {
    expect(formatAccommodationNightCountLabel(1)).toBe("לילה אחד");
  });

  it("uses plural Hebrew for multiple nights", () => {
    expect(formatAccommodationNightCountLabel(3)).toBe("3 לילות");
  });
});
