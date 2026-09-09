import { describe, expect, it } from "vitest";
import { DEFAULT_PHRASEBOOK_PACK_ID } from "./constants";
import { HE_JA_PHRASES } from "./builtin/he-ja";
import { getDefaultPhrasebookPack } from "./builtin/registry";
import { PHRASEBOOK_CATEGORIES } from "./types";

describe("phrasebook catalog validation", () => {
  it("registers the default he-ja pack with ~58 phrases", () => {
    const pack = getDefaultPhrasebookPack();

    expect(pack.id).toBe(DEFAULT_PHRASEBOOK_PACK_ID);
    expect(pack.sourceLanguage).toBe("he");
    expect(pack.targetLanguage).toBe("ja");
    expect(pack.phrases.length).toBeGreaterThanOrEqual(58);
    expect(pack.phrases).toBe(HE_JA_PHRASES);
  });

  it("uses unique phrase ids and valid categories", () => {
    const ids = new Set<string>();

    for (const phrase of HE_JA_PHRASES) {
      expect(ids.has(phrase.id)).toBe(false);
      ids.add(phrase.id);

      expect(PHRASEBOOK_CATEGORIES).toContain(phrase.category);
      expect(phrase.packId).toBe(DEFAULT_PHRASEBOOK_PACK_ID);
      expect(phrase.sourceLanguage).toBe("he");
      expect(phrase.targetLanguage).toBe("ja");
      expect(phrase.sourceText.trim().length).toBeGreaterThan(0);
      expect(phrase.targetText.trim().length).toBeGreaterThan(0);
    }

    expect(ids.size).toBe(HE_JA_PHRASES.length);
  });

  it("requires pronunciation fields and avoids lowercase latin copies", () => {
    for (const phrase of HE_JA_PHRASES) {
      expect(phrase.pronunciationLatin?.trim().length).toBeGreaterThan(0);
      expect(phrase.pronunciationSource?.trim().length).toBeGreaterThan(0);

      const latinLower = phrase.pronunciationLatin?.trim().toLowerCase();
      expect(phrase.pronunciationSource?.trim().toLowerCase()).not.toBe(latinLower);
    }
  });
});
