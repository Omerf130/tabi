import { buildLanguagePhraseHref } from "./constants";
import { createPhrasebookCategoryLabelResolver } from "./phrasebook-labels";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { buildSearchBlob } from "./search-phrases";
import type {
  PhraseDetailViewModel,
  PhraseListItemViewModel,
  PhrasebookPhrase,
} from "./types";

export function toPhraseListItemViewModel(
  tripId: string,
  phrase: PhrasebookPhrase,
  isFavorite: boolean,
  t: AppTranslator<"Language">,
): PhraseListItemViewModel {
  const getCategoryLabel = createPhrasebookCategoryLabelResolver(t);

  return {
    id: phrase.id,
    sourceText: phrase.sourceText,
    targetTextPreview: phrase.targetText,
    category: phrase.category,
    categoryLabel: getCategoryLabel(phrase.category),
    isFavorite,
    detailHref: buildLanguagePhraseHref(tripId, phrase.id),
    searchBlob: buildSearchBlob(phrase, getCategoryLabel),
  };
}

export function toPhraseDetailViewModel(
  phrase: PhrasebookPhrase,
  isFavorite: boolean,
  t: AppTranslator<"Language">,
): PhraseDetailViewModel {
  const getCategoryLabel = createPhrasebookCategoryLabelResolver(t);

  return {
    id: phrase.id,
    sourceText: phrase.sourceText,
    targetText: phrase.targetText,
    pronunciationLatin: phrase.pronunciationLatin,
    pronunciationSource: phrase.pronunciationSource,
    categoryLabel: getCategoryLabel(phrase.category),
    isFavorite,
  };
}

export function createPhrasebookCategoryLabels(
  t: AppTranslator<"Language">,
): Record<string, string> {
  const getCategoryLabel = createPhrasebookCategoryLabelResolver(t);
  return {
    basics: getCategoryLabel("basics"),
    restaurants: getCategoryLabel("restaurants"),
    transport: getCategoryLabel("transport"),
    hotel: getCategoryLabel("hotel"),
    shopping: getCategoryLabel("shopping"),
    directions: getCategoryLabel("directions"),
    emergency: getCategoryLabel("emergency"),
    numbers_time: getCategoryLabel("numbers_time"),
  };
}
