import { PHRASEBOOK_CATEGORY_LABELS } from "./constants";
import type { PhrasebookPhrase } from "./types";

export type SearchablePhrase = PhrasebookPhrase & {
  searchBlob: string;
};

export function buildSearchBlob(phrase: PhrasebookPhrase): string {
  const parts = [
    phrase.sourceText,
    phrase.targetText,
    phrase.pronunciationLatin,
    phrase.pronunciationSource,
    PHRASEBOOK_CATEGORY_LABELS[phrase.category],
    ...(phrase.searchKeywords ?? []),
  ];
  return normalizeSearchText(parts.filter(Boolean).join(" "));
}

export function toSearchablePhrases(
  phrases: readonly PhrasebookPhrase[],
): SearchablePhrase[] {
  return phrases.map((phrase) => ({
    ...phrase,
    searchBlob: buildSearchBlob(phrase),
  }));
}

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

export function searchPhrases(
  phrases: readonly SearchablePhrase[],
  rawQuery: string,
): SearchablePhrase[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) {
    return [...phrases];
  }

  return phrases.filter((phrase) => phrase.searchBlob.includes(query));
}

export function filterPhrasesByCategory(
  phrases: readonly PhrasebookPhrase[],
  category: string | null | undefined,
): PhrasebookPhrase[] {
  if (!category?.trim()) {
    return [...phrases];
  }
  return phrases.filter((phrase) => phrase.category === category);
}

export function filterPhrasesByFavorites(
  phrases: readonly PhrasebookPhrase[],
  favoriteIds: ReadonlySet<string>,
): PhrasebookPhrase[] {
  return phrases.filter((phrase) => favoriteIds.has(phrase.id));
}
