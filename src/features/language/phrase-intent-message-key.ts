/**
 * Maps a phrase intent id (category.slug) to a Language namespace message key.
 */
export function resolvePhraseIntentMessageKey(phraseIntentId: string): string {
  const separatorIndex = phraseIntentId.indexOf(".");
  if (separatorIndex <= 0 || separatorIndex === phraseIntentId.length - 1) {
    throw new Error(`Invalid phrase intent id: ${phraseIntentId}`);
  }

  const category = phraseIntentId.slice(0, separatorIndex);
  const slug = phraseIntentId.slice(separatorIndex + 1);
  return `phrases.${category}.${slug}`;
}
