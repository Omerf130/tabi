import "server-only";

import { connectDb } from "@/lib/db/connect";
import { PhraseTranslationCache } from "@/models/PhraseTranslationCache";
import {
  CANONICAL_PHRASE_SOURCE_LANGUAGE,
  PHRASE_TRANSLATION_CONTENT_VERSION,
  PHRASE_TRANSLATION_PROVIDER,
} from "./constants";

export type PhraseTranslationCacheRow = {
  phraseId: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  transliterationLatin: string | null;
  contentVersion: string;
  provider: string;
};

export async function findPhraseTranslationCacheRows(input: {
  phraseIds: readonly string[];
  sourceLanguage?: string;
  targetLanguage: string;
  contentVersion?: string;
}): Promise<Map<string, PhraseTranslationCacheRow>> {
  if (input.phraseIds.length === 0) {
    return new Map();
  }

  await connectDb();

  const sourceLanguage = input.sourceLanguage ?? CANONICAL_PHRASE_SOURCE_LANGUAGE;
  const contentVersion = input.contentVersion ?? PHRASE_TRANSLATION_CONTENT_VERSION;

  const rows = await PhraseTranslationCache.find({
    phraseId: { $in: [...input.phraseIds] },
    sourceLanguage,
    targetLanguage: input.targetLanguage,
    contentVersion,
  }).lean();

  const byPhraseId = new Map<string, PhraseTranslationCacheRow>();
  for (const row of rows) {
    byPhraseId.set(row.phraseId, {
      phraseId: row.phraseId,
      sourceLanguage: row.sourceLanguage,
      targetLanguage: row.targetLanguage,
      translatedText: row.translatedText,
      transliterationLatin: row.transliterationLatin?.trim() || null,
      contentVersion: row.contentVersion,
      provider: row.provider,
    });
  }

  return byPhraseId;
}

export async function upsertPhraseTranslationCacheRows(
  rows: readonly PhraseTranslationCacheRow[],
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  await connectDb();

  const operations = rows.map((row) => ({
    updateOne: {
      filter: {
        phraseId: row.phraseId,
        sourceLanguage: row.sourceLanguage,
        targetLanguage: row.targetLanguage,
        contentVersion: row.contentVersion,
      },
      update: {
        $set: {
          phraseId: row.phraseId,
          sourceLanguage: row.sourceLanguage,
          targetLanguage: row.targetLanguage,
          contentVersion: row.contentVersion,
          translatedText: row.translatedText,
          transliterationLatin: row.transliterationLatin,
          provider: row.provider || PHRASE_TRANSLATION_PROVIDER,
        },
      },
      upsert: true,
    },
  }));

  try {
    await PhraseTranslationCache.bulkWrite(operations, { ordered: false });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 11000) {
      return;
    }
    throw error;
  }
}
