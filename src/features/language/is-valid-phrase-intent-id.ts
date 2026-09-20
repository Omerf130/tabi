import { getPhraseIntentById } from "./phrase-intent-catalog";

export function isValidPhraseIntentId(phraseId: string): boolean {
  return getPhraseIntentById(phraseId) !== undefined;
}
