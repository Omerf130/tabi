import "server-only";

import { getDefaultPhrasebookPack } from "./builtin/registry";
import { DEFAULT_PHRASEBOOK_PACK_ID, PHRASEBOOK_CATEGORY_LABELS } from "./constants";
import { listFavoritePhraseIds } from "./phrase-favorite-domain";
import { toPhraseDetailViewModel, toPhraseListItemViewModel } from "./to-phrase-view-model";
import type { LanguagePageViewModel, PhraseDetailViewModel } from "./types";

export async function prepareLanguagePage(
  tripId: string,
  userId: string,
): Promise<LanguagePageViewModel> {
  const pack = getDefaultPhrasebookPack();
  const favoritePhraseIds = await listFavoritePhraseIds(userId, pack.targetLanguage);
  const favoriteSet = new Set(favoritePhraseIds);

  const phrases = pack.phrases.map((phrase) =>
    toPhraseListItemViewModel(tripId, phrase, favoriteSet.has(phrase.id)),
  );

  return {
    tripId,
    packId: DEFAULT_PHRASEBOOK_PACK_ID,
    targetLanguage: pack.targetLanguage,
    phrases,
    favoritePhraseIds,
    categoryLabels: PHRASEBOOK_CATEGORY_LABELS,
  };
}

export async function getPhraseDetailForTrip(
  tripId: string,
  userId: string,
  phraseId: string,
): Promise<PhraseDetailViewModel | null> {
  const pack = getDefaultPhrasebookPack();
  const phrase = pack.phrases.find((item) => item.id === phraseId);
  if (!phrase) {
    return null;
  }

  const favoritePhraseIds = await listFavoritePhraseIds(userId, pack.targetLanguage);
  return toPhraseDetailViewModel(phrase, favoritePhraseIds.includes(phraseId));
}
