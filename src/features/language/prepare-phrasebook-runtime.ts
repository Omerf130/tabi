import "server-only";

import type { AppLocale } from "@/features/i18n/locale";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import {
  buildSettingsLanguageHref,
  buildTripDetailsSettingsHref,
} from "@/features/settings/constants";
import type { TripWorkspace } from "@/features/trips/public-trip";
import {
  PHRASE_INTENTS,
  getPhraseIntentById,
  listPhraseIntentsInCatalogOrder,
} from "./phrase-intent-catalog";
import { getPhraseIntentUiSourceText } from "./phrase-intent-i18n";
import { getPhraseIntentSearchKeywords } from "./phrase-intent-search-metadata";
import { listFavoritePhraseIds } from "./phrase-favorite-domain";
import { createPhrasebookCategoryLabels } from "./to-phrase-view-model";
import { buildRuntimePhraseSearchBlob } from "./search-phrases";
import { resolveLanguageTextDirection } from "./resolve-language-text-direction";
import type {
  LanguagePageViewModel,
  PhraseDetailViewModel,
  PhraseListItemViewModel,
  PhrasebookRuntimeState,
} from "./types";
import { buildLanguagePhraseHref } from "./constants";
import { createPhrasebookCategoryLabelResolver } from "./phrasebook-labels";
import {
  findPhraseTranslationCacheRows,
  type PhraseTranslationCacheRow,
} from "./translation/phrase-translation-cache-repository";
import { resolveCanonicalPhraseTranslations } from "./translation/resolve-canonical-phrase-translations";
import {
  CANONICAL_PHRASE_SOURCE_LANGUAGE,
  PHRASE_TRANSLATION_CONTENT_VERSION,
} from "./translation/constants";
import type { CanonicalPhraseTranslation } from "./translation/canonical-phrase-translation.types";
type ResolvedTranslationMap = Map<string, CanonicalPhraseTranslation>;

async function resolveTranslationMap(input: {
  targetLanguage: string;
  phraseIntents: readonly (typeof PHRASE_INTENTS)[number][];
}): Promise<{
  translations: ResolvedTranslationMap;
  translationWarning: boolean;
}> {
  try {
    const resolved = await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: input.targetLanguage,
      phraseIntents: input.phraseIntents,
    });

    return {
      translations: new Map(
        resolved.translations.map((entry) => [entry.phraseId, entry]),
      ),
      translationWarning: false,
    };
  } catch {
    const cached = await findPhraseTranslationCacheRows({
      phraseIds: input.phraseIntents.map((intent) => intent.id),
      targetLanguage: input.targetLanguage,
      contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
    });

    const translations: ResolvedTranslationMap = new Map();
    for (const intent of input.phraseIntents) {
      const row = cached.get(intent.id);
      if (row) {
        translations.set(intent.id, cacheRowToTranslation(row));
      }
    }

    return {
      translations,
      translationWarning: true,
    };
  }
}

function cacheRowToTranslation(
  row: PhraseTranslationCacheRow,
): CanonicalPhraseTranslation {
  return {
    phraseId: row.phraseId,
    sourceLanguage: CANONICAL_PHRASE_SOURCE_LANGUAGE,
    targetLanguage: row.targetLanguage,
    translatedText: row.translatedText,
    transliterationLatin: row.transliterationLatin,
    status: "available",
    fromCache: true,
    contentVersion: row.contentVersion,
  };
}

function buildListItemViewModel(input: {
  tripId: string;
  intent: (typeof PHRASE_INTENTS)[number];
  isFavorite: boolean;
  targetLanguage: string | null;
  targetLanguageDirection: "ltr" | "rtl";
  translation: CanonicalPhraseTranslation | undefined;
  targetUnavailableLabel: string;
  t: AppTranslator<"Language">;
}): PhraseListItemViewModel {
  const getCategoryLabel = createPhrasebookCategoryLabelResolver(input.t);
  const sourceText = getPhraseIntentUiSourceText(input.intent.id, input.t);
  const targetAvailable =
    input.translation?.status === "available" &&
    Boolean(input.translation.translatedText?.trim());

  const targetTextPreview = targetAvailable
    ? input.translation!.translatedText!
    : input.targetUnavailableLabel;

  return {
    id: input.intent.id,
    sourceText,
    targetTextPreview,
    targetLanguage: input.targetLanguage,
    targetLanguageDirection: input.targetLanguageDirection,
    targetAvailable,
    category: input.intent.category,
    categoryLabel: getCategoryLabel(input.intent.category),
    isFavorite: input.isFavorite,
    detailHref: buildLanguagePhraseHref(input.tripId, input.intent.id),
    searchBlob: buildRuntimePhraseSearchBlob({
      sourceText,
      targetText: targetAvailable ? input.translation!.translatedText! : undefined,
      transliterationLatin: input.translation?.transliterationLatin ?? undefined,
      searchKeywords: getPhraseIntentSearchKeywords(input.intent),
      categoryLabel: getCategoryLabel(input.intent.category),
    }),
  };
}

function buildDetailViewModel(input: {
  intent: (typeof PHRASE_INTENTS)[number];
  isFavorite: boolean;
  targetLanguage: string | null;
  targetLanguageDirection: "ltr" | "rtl";
  translation: CanonicalPhraseTranslation | undefined;
  targetUnavailableLabel: string;
  t: AppTranslator<"Language">;
}): PhraseDetailViewModel {
  const getCategoryLabel = createPhrasebookCategoryLabelResolver(input.t);
  const sourceText = getPhraseIntentUiSourceText(input.intent.id, input.t);
  const targetAvailable =
    input.translation?.status === "available" &&
    Boolean(input.translation.translatedText?.trim());

  return {
    id: input.intent.id,
    sourceText,
    targetText: targetAvailable
      ? input.translation!.translatedText!
      : input.targetUnavailableLabel,
    targetLanguage: input.targetLanguage,
    targetLanguageDirection: input.targetLanguageDirection,
    targetAvailable,
    transliterationLatin: targetAvailable
      ? input.translation?.transliterationLatin ?? null
      : null,
    categoryLabel: getCategoryLabel(input.intent.category),
    isFavorite: input.isFavorite,
  };
}

export async function buildLanguagePageViewModel(input: {
  trip: TripWorkspace;
  userId: string;
  uiLocale: AppLocale;
  t: AppTranslator<"Language">;
}): Promise<LanguagePageViewModel> {
  const targetLanguage = input.trip.effectiveTravelLanguageCode;
  const targetLanguageDirection = resolveLanguageTextDirection(targetLanguage);
  const targetUnavailableLabel = input.t("runtime.targetUnavailable");

  let runtimeState: PhrasebookRuntimeState = "ready";
  let translationWarning = false;

  const phraseIntents = listPhraseIntentsInCatalogOrder();
  let translationMap: ResolvedTranslationMap = new Map();

  if (!targetLanguage) {
    runtimeState = "unknown_travel_language";
  } else {
    const resolved = await resolveTranslationMap({
      targetLanguage,
      phraseIntents,
    });
    translationMap = resolved.translations;
    translationWarning = resolved.translationWarning;
    if (translationWarning) {
      runtimeState = "translation_unavailable";
    }
  }

  const favoritePhraseIds = targetLanguage
    ? await listFavoritePhraseIds(input.userId, targetLanguage)
    : [];
  const favoriteSet = new Set(favoritePhraseIds);

  const phrases =
    runtimeState === "unknown_travel_language"
      ? []
      : phraseIntents.map((intent) =>
          buildListItemViewModel({
            tripId: input.trip.id,
            intent,
            isFavorite: favoriteSet.has(intent.id),
            targetLanguage,
            targetLanguageDirection,
            translation: translationMap.get(intent.id),
            targetUnavailableLabel,
            t: input.t,
          }),
        );

  return {
    tripId: input.trip.id,
    runtimeState,
    sourceLocale: input.uiLocale,
    targetLanguage,
    targetLanguageDirection,
    phrases,
    favoritePhraseIds,
    categoryLabels: createPhrasebookCategoryLabels(input.t),
    tripDetailsHref: buildTripDetailsSettingsHref(input.trip.id),
    travelLanguageSettingsHref: buildSettingsLanguageHref(input.trip.id),
    translationWarning,
    customTranslationEnabled: Boolean(targetLanguage),
  };
}

export async function buildPhraseDetailViewModelForTrip(input: {
  trip: TripWorkspace;
  userId: string;
  phraseId: string;
  t: AppTranslator<"Language">;
}): Promise<PhraseDetailViewModel | null> {
  const intent = getPhraseIntentById(input.phraseId);
  if (!intent) {
    return null;
  }

  const targetLanguage = input.trip.effectiveTravelLanguageCode;
  const targetLanguageDirection = resolveLanguageTextDirection(targetLanguage);
  const targetUnavailableLabel = input.t("runtime.targetUnavailable");

  let translation: CanonicalPhraseTranslation | undefined;
  if (targetLanguage) {
    const resolved = await resolveTranslationMap({
      targetLanguage,
      phraseIntents: [intent],
    });
    translation = resolved.translations.get(intent.id);
  }

  const favoritePhraseIds = targetLanguage
    ? await listFavoritePhraseIds(input.userId, targetLanguage)
    : [];

  return buildDetailViewModel({
    intent,
    isFavorite: favoritePhraseIds.includes(intent.id),
    targetLanguage,
    targetLanguageDirection,
    translation,
    targetUnavailableLabel,
    t: input.t,
  });
}

