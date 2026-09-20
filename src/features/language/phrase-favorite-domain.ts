import "server-only";

import { connectDb } from "@/lib/db/connect";
import { PhraseFavorite } from "@/models/PhraseFavorite";
import { isValidPhraseIntentId } from "./is-valid-phrase-intent-id";
import { PHRASEBOOK_ERROR_CODES } from "./constants";
import { normalizeTravelLanguageCode } from "@/features/trips/destination/normalize-travel-language-code";

export class PhraseFavoriteValidationError extends Error {
  readonly code: (typeof PHRASEBOOK_ERROR_CODES)[keyof typeof PHRASEBOOK_ERROR_CODES];

  constructor(code: (typeof PHRASEBOOK_ERROR_CODES)[keyof typeof PHRASEBOOK_ERROR_CODES]) {
    super(code);
    this.code = code;
    this.name = "PhraseFavoriteValidationError";
  }
}

function assertValidFavoriteTarget(input: {
  targetLanguage: string;
  phraseId: string;
}): string {
  const normalizedTarget = normalizeTravelLanguageCode(input.targetLanguage);
  if (!normalizedTarget) {
    throw new PhraseFavoriteValidationError(PHRASEBOOK_ERROR_CODES.favoriteFailed);
  }

  if (!isValidPhraseIntentId(input.phraseId)) {
    throw new PhraseFavoriteValidationError(PHRASEBOOK_ERROR_CODES.favoriteFailed);
  }

  return normalizedTarget;
}

export async function listFavoritePhraseIds(
  userId: string,
  targetLanguage: string,
): Promise<string[]> {
  await connectDb();
  const normalizedTarget = normalizeTravelLanguageCode(targetLanguage) ?? targetLanguage;
  const documents = await PhraseFavorite.find({ userId, targetLanguage: normalizedTarget })
    .sort({ createdAt: 1, phraseId: 1 })
    .lean();

  return documents.map((document) => document.phraseId);
}

export async function togglePhraseFavorite(input: {
  userId: string;
  targetLanguage: string;
  phraseId: string;
}): Promise<{ isFavorite: boolean }> {
  const targetLanguage = assertValidFavoriteTarget(input);

  await connectDb();

  const existing = await PhraseFavorite.findOne({
    userId: input.userId,
    targetLanguage,
    phraseId: input.phraseId,
  }).lean();

  if (existing) {
    await PhraseFavorite.deleteOne({ _id: existing._id });
    return { isFavorite: false };
  }

  try {
    await PhraseFavorite.create({
      userId: input.userId,
      targetLanguage,
      phraseId: input.phraseId,
    });
    return { isFavorite: true };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11_000
    ) {
      return { isFavorite: true };
    }
    throw error;
  }
}
