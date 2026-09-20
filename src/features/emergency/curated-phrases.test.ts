import { describe, expect, it } from "vitest";
import { PHRASE_INTENTS } from "@/features/language/phrase-intent-catalog";
import { CURATED_EMERGENCY_PHRASE_IDS } from "./constants";

describe("curated emergency phrases", () => {
  it("maps to semantic phrase intents", () => {
    const intentIds = new Set(PHRASE_INTENTS.map((intent) => intent.id));
    for (const phraseId of CURATED_EMERGENCY_PHRASE_IDS) {
      expect(intentIds.has(phraseId)).toBe(true);
    }
  });
});
