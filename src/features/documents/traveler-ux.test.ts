import { describe, expect, it } from "vitest";
import { TRAVEL_DOCUMENT_FILTER_OPTIONS } from "./constants";

describe("travel document traveler UX constants", () => {
  it("renders all category filter chips", () => {
    expect(TRAVEL_DOCUMENT_FILTER_OPTIONS.map((option) => option.label)).toEqual([
      "הכל",
      "טיסות",
      "לינה",
      "רכבות",
      "כרטיסים",
      "ביטוח",
      "הזמנות",
      "תחבורה",
      "אחר",
    ]);
  });
});
