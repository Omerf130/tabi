import type { PhraseIntent } from "./phrase-intent-types";

/**
 * Destination-neutral search keywords for an intent.
 * Runtime search will also include localized source text and translated target text later.
 */
export function getPhraseIntentSearchKeywords(
  intent: PhraseIntent,
): readonly string[] {
  return intent.searchKeywords ?? [];
}

export function buildPhraseIntentSearchMetadata(intent: PhraseIntent): {
  phraseIntentId: string;
  category: PhraseIntent["category"];
  searchKeywords: readonly string[];
} {
  return {
    phraseIntentId: intent.id,
    category: intent.category,
    searchKeywords: getPhraseIntentSearchKeywords(intent),
  };
}
