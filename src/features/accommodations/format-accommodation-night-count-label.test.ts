import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { formatAccommodationNightCountLabel } from "./format-accommodation-night-count-label";

describe("formatAccommodationNightCountLabel", () => {
  const t = createAppTranslator("Accommodation", "he");

  it("uses singular Hebrew for one night", () => {
    expect(formatAccommodationNightCountLabel(1, t)).toBe("לילה אחד");
  });

  it("uses plural Hebrew for multiple nights", () => {
    expect(formatAccommodationNightCountLabel(3, t)).toBe("3 לילות");
  });
});
