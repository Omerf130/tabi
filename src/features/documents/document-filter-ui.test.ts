import { describe, expect, it } from "vitest";
import {
  TRAVEL_WALLET_VISUAL_FILTERS,
  filterDocumentsByVisualFilter,
  formatDocumentCountHebrew,
  formatLinkedCountHebrew,
} from "./document-filter-ui";

describe("travel wallet visual filters", () => {
  it("renders traveler-facing filter labels", () => {
    expect(TRAVEL_WALLET_VISUAL_FILTERS.map((option) => option.label)).toEqual([
      "הכל",
      "טיסות",
      "לינה",
      "רכבות",
      "כרטיסים",
      "ביטוח",
      "עוד",
    ]);
  });

  it("groups secondary categories under more", () => {
    const documents = [
      { category: "flight" as const },
      { category: "reservation" as const },
      { category: "transport" as const },
      { category: "other" as const },
    ];

    expect(filterDocumentsByVisualFilter(documents, "more")).toHaveLength(3);
    expect(filterDocumentsByVisualFilter(documents, "flight")).toHaveLength(1);
  });

  it("formats Hebrew document counts", () => {
    expect(formatDocumentCountHebrew(1)).toBe("1 מסמך בארנק");
    expect(formatDocumentCountHebrew(3)).toBe("3 מסמכים בארנק");
  });

  it("formats Hebrew linked counts", () => {
    expect(formatLinkedCountHebrew(1)).toBe("1 מסמך מקושר");
    expect(formatLinkedCountHebrew(2)).toBe("2 מסמכים מקושרים");
  });
});
