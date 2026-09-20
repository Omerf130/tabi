import "server-only";

import type { PhraseIntent } from "../phrase-intent-types";
import { PHRASE_INTENTS } from "../phrase-intent-catalog";
import { translateTexts, transliterateTexts } from "./azure-translator.server";
import { resolveAzureTransliterationSpec } from "./azure-transliteration-capability";
import {
  isEnglishTargetLanguage,
  toAzureTranslatorTargetLanguage,
} from "./azure-translator-target-language";
import {
  CANONICAL_PHRASE_SOURCE_LANGUAGE,
  PHRASE_TRANSLATION_CONTENT_VERSION,
  PHRASE_TRANSLATION_PROVIDER,
} from "./constants";
import type {
  CanonicalPhraseTranslation,
  ResolveCanonicalPhraseTranslationsResult,
} from "./canonical-phrase-translation.types";
import {
  findPhraseTranslationCacheRows,
  upsertPhraseTranslationCacheRows,
  type PhraseTranslationCacheRow,
} from "./phrase-translation-cache-repository";

type TranslationDeps = {
  translateTexts: typeof translateTexts;
  transliterateTexts: typeof transliterateTexts;
  findPhraseTranslationCacheRows: typeof findPhraseTranslationCacheRows;
  upsertPhraseTranslationCacheRows: typeof upsertPhraseTranslationCacheRows;
};

const defaultDeps: TranslationDeps = {
  translateTexts,
  transliterateTexts,
  findPhraseTranslationCacheRows,
  upsertPhraseTranslationCacheRows,
};

function buildUnavailableTranslation(
  phraseId: string,
  targetLanguage: string | null,
): CanonicalPhraseTranslation {
  return {
    phraseId,
    sourceLanguage: CANONICAL_PHRASE_SOURCE_LANGUAGE,
    targetLanguage,
    translatedText: null,
    transliterationLatin: null,
    status: "unavailable",
    fromCache: false,
    contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
  };
}

function cacheRowToTranslation(
  row: PhraseTranslationCacheRow,
  fromCache: boolean,
): CanonicalPhraseTranslation {
  return {
    phraseId: row.phraseId,
    sourceLanguage: CANONICAL_PHRASE_SOURCE_LANGUAGE,
    targetLanguage: row.targetLanguage,
    translatedText: row.translatedText,
    transliterationLatin: row.transliterationLatin,
    status: "available",
    fromCache,
    contentVersion: row.contentVersion,
  };
}

export async function resolveCanonicalPhraseTranslations(input: {
  targetTravelLanguageCode: string | null | undefined;
  phraseIntents?: readonly PhraseIntent[];
  deps?: Partial<TranslationDeps>;
}): Promise<ResolveCanonicalPhraseTranslationsResult> {
  const deps = { ...defaultDeps, ...input.deps };
  const phraseIntents = input.phraseIntents ?? PHRASE_INTENTS;
  const normalizedTarget = input.targetTravelLanguageCode
    ? toAzureTranslatorTargetLanguage(input.targetTravelLanguageCode)
    : null;

  const stats = {
    cacheHits: 0,
    cacheMisses: 0,
    azureTranslateCalls: 0,
    azureTransliterateCalls: 0,
  };

  if (!normalizedTarget) {
    return {
      targetLanguage: null,
      translations: phraseIntents.map((intent) =>
        buildUnavailableTranslation(intent.id, null),
      ),
      stats,
    };
  }

  const cachedRows = await deps.findPhraseTranslationCacheRows({
    phraseIds: phraseIntents.map((intent) => intent.id),
    targetLanguage: normalizedTarget,
    contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
  });

  const misses: PhraseIntent[] = [];
  for (const intent of phraseIntents) {
    if (!cachedRows.has(intent.id)) {
      misses.push(intent);
    } else {
      stats.cacheHits += 1;
    }
  }
  stats.cacheMisses = misses.length;

  const resolvedByPhraseId = new Map<string, CanonicalPhraseTranslation>();

  for (const [phraseId, row] of cachedRows.entries()) {
    resolvedByPhraseId.set(phraseId, cacheRowToTranslation(row, true));
  }

  if (misses.length === 0) {
    return {
      targetLanguage: normalizedTarget,
      translations: phraseIntents.map(
        (intent) => resolvedByPhraseId.get(intent.id)!,
      ),
      stats,
    };
  }

  const rowsToUpsert: PhraseTranslationCacheRow[] = [];

  if (isEnglishTargetLanguage(normalizedTarget)) {
    for (const intent of misses) {
      const row: PhraseTranslationCacheRow = {
        phraseId: intent.id,
        sourceLanguage: CANONICAL_PHRASE_SOURCE_LANGUAGE,
        targetLanguage: normalizedTarget,
        translatedText: intent.azureSourceText,
        transliterationLatin: null,
        contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
        provider: PHRASE_TRANSLATION_PROVIDER,
      };
      rowsToUpsert.push(row);
      resolvedByPhraseId.set(intent.id, cacheRowToTranslation(row, false));
    }
  } else {
    stats.azureTranslateCalls = 1;
    const translated = await deps.translateTexts({
      texts: misses.map((intent) => intent.azureSourceText),
      from: CANONICAL_PHRASE_SOURCE_LANGUAGE,
      to: normalizedTarget,
    });

    const transliterationSpec = resolveAzureTransliterationSpec(normalizedTarget);
    let transliterations: readonly (string | null)[] = misses.map(() => null);

    if (transliterationSpec) {
      try {
        stats.azureTransliterateCalls = 1;
        const transliterationResult = await deps.transliterateTexts({
          texts: translated.translations,
          language: transliterationSpec.language,
          fromScript: transliterationSpec.fromScript,
          toScript: transliterationSpec.toScript,
        });
        transliterations = transliterationResult.transliterations;
      } catch {
        transliterations = misses.map(() => null);
      }
    }

    misses.forEach((intent, index) => {
      const row: PhraseTranslationCacheRow = {
        phraseId: intent.id,
        sourceLanguage: CANONICAL_PHRASE_SOURCE_LANGUAGE,
        targetLanguage: normalizedTarget,
        translatedText: translated.translations[index]!,
        transliterationLatin: transliterations[index] ?? null,
        contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
        provider: PHRASE_TRANSLATION_PROVIDER,
      };
      rowsToUpsert.push(row);
      resolvedByPhraseId.set(intent.id, cacheRowToTranslation(row, false));
    });
  }

  await deps.upsertPhraseTranslationCacheRows(rowsToUpsert);

  return {
    targetLanguage: normalizedTarget,
    translations: phraseIntents.map((intent) => {
      const resolved = resolvedByPhraseId.get(intent.id);
      if (!resolved) {
        return buildUnavailableTranslation(intent.id, normalizedTarget);
      }
      return resolved;
    }),
    stats,
  };
}
