import { describe, expect, it } from "vitest";
import { createHebrewDocumentsTranslator } from "@/features/i18n/test-translators";
import { createTravelWalletVisualFilterOptions } from "./document-labels";

describe("travel document traveler UX constants", () => {
  it("renders all category filter chips", () => {
    const t = createHebrewDocumentsTranslator();
    expect(createTravelWalletVisualFilterOptions(t).map((option) => option.label)).toEqual([
      "הכל",
      "טיסות",
      "לינה",
      "רכבות",
      "כרטיסים",
      "ביטוח",
      "עוד",
    ]);
  });
});
