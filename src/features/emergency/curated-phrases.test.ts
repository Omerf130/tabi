import { describe, expect, it } from "vitest";
import { getPhraseFromDefaultPack } from "@/features/language/builtin/registry";
import { CURATED_EMERGENCY_PHRASE_IDS } from "./constants";

describe("curated emergency phrases", () => {
  it("exists in the default phrasebook pack", () => {
    for (const phraseId of CURATED_EMERGENCY_PHRASE_IDS) {
      expect(getPhraseFromDefaultPack(phraseId)?.id).toBe(phraseId);
    }
  });
});
