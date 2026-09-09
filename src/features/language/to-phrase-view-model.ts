import {
  PHRASEBOOK_CATEGORY_LABELS,
  buildLanguagePhraseHref,
} from "./constants";
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
): PhraseListItemViewModel {
  return {
    id: phrase.id,
    sourceText: phrase.sourceText,
    targetTextPreview: phrase.targetText,
    category: phrase.category,
    categoryLabel: PHRASEBOOK_CATEGORY_LABELS[phrase.category],
    isFavorite,
    detailHref: buildLanguagePhraseHref(tripId, phrase.id),
    searchBlob: buildSearchBlob(phrase),
  };
}

export function toPhraseDetailViewModel(
  phrase: PhrasebookPhrase,
  isFavorite: boolean,
): PhraseDetailViewModel {
  return {
    id: phrase.id,
    sourceText: phrase.sourceText,
    targetText: phrase.targetText,
    pronunciationLatin: phrase.pronunciationLatin,
    pronunciationSource: phrase.pronunciationSource,
    categoryLabel: PHRASEBOOK_CATEGORY_LABELS[phrase.category],
    isFavorite,
  };
}
