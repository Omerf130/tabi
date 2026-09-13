import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { createPhrasebookCategoryLabelResolver } from "./phrasebook-labels";
import type { PhrasebookPhrase } from "./types";

export type SearchablePhrase = PhrasebookPhrase & {
  searchBlob: string;
};

export function buildSearchBlob(
  phrase: PhrasebookPhrase,
  getCategoryLabel: ReturnType<typeof createPhrasebookCategoryLabelResolver>,
): string {
  const parts = [
    phrase.sourceText,
    phrase.targetText,
    phrase.pronunciationLatin,
    phrase.pronunciationSource,
    getCategoryLabel(phrase.category),
    ...(phrase.searchKeywords ?? []),
  ];
  return normalizeSearchText(parts.filter(Boolean).join(" "));
}

export function toSearchablePhrases(
  phrases: readonly PhrasebookPhrase[],
  getCategoryLabel: ReturnType<typeof createPhrasebookCategoryLabelResolver>,
): SearchablePhrase[] {
  return phrases.map((phrase) => ({
    ...phrase,
    searchBlob: buildSearchBlob(phrase, getCategoryLabel),
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

export type PhrasebookCategoryLabelResolver = ReturnType<
  typeof createPhrasebookCategoryLabelResolver
>;

export function createPhrasebookSearchContext(t: AppTranslator<"Language">) {
  const getCategoryLabel = createPhrasebookCategoryLabelResolver(t);
  return {
    getCategoryLabel,
    toSearchablePhrases: (phrases: readonly PhrasebookPhrase[]) =>
      toSearchablePhrases(phrases, getCategoryLabel),
  };
}
