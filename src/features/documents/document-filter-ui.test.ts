import { describe, expect, it } from "vitest";
import enMessages from "../../../messages/en.json";
import heMessages from "../../../messages/he.json";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import {
  createTravelWalletVisualFilterOptions,
  formatDocumentLinkedCount,
  formatDocumentWalletCount,
} from "./document-labels";
import { filterDocumentsByVisualFilter } from "./document-filter-ui";

describe("travel wallet visual filters", () => {
  it("renders traveler-facing filter labels", () => {
    const t = createAppTranslator("Documents", "he");
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

  it("renders English filter labels", () => {
    const t = createAppTranslator("Documents", "en");
    expect(createTravelWalletVisualFilterOptions(t).map((option) => option.label)).toEqual([
      "All",
      "Flights",
      "Stays",
      "Trains",
      "Tickets",
      "Insurance",
      "More",
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

  it("formats localized document counts", () => {
    const tHe = createAppTranslator("Documents", "he");
    const tEn = createAppTranslator("Documents", "en");
    expect(formatDocumentWalletCount(1, tHe)).toBe("1 מסמך בארנק");
    expect(formatDocumentWalletCount(3, tHe)).toBe("3 מסמכים בארנק");
    expect(formatDocumentWalletCount(1, tEn)).toBe("1 document in wallet");
  });

  it("formats localized linked counts", () => {
    const tHe = createAppTranslator("Documents", "he");
    expect(formatDocumentLinkedCount(1, tHe)).toBe("1 מסמך מקושר");
    expect(formatDocumentLinkedCount(2, tHe)).toBe("2 מסמכים מקושרים");
  });

  it("keeps Hebrew and English Documents namespaces aligned", () => {
    expect(Object.keys(heMessages.Documents.categories)).toEqual(
      Object.keys(enMessages.Documents.categories),
    );
  });
});
