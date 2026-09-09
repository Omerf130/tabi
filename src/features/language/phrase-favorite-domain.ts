import "server-only";

import { connectDb } from "@/lib/db/connect";
import { PhraseFavorite } from "@/models/PhraseFavorite";
import { DEFAULT_PHRASEBOOK_PACK_ID, PHRASEBOOK_MESSAGES } from "./constants";
import { getDefaultPhrasebookPack, getPhraseFromDefaultPack } from "./builtin/registry";

export class PhraseFavoriteValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhraseFavoriteValidationError";
  }
}

function resolveTargetLanguageFromPack(packId: string): string {
  if (packId !== DEFAULT_PHRASEBOOK_PACK_ID) {
    throw new PhraseFavoriteValidationError(PHRASEBOOK_MESSAGES.favoriteFailed);
  }
  return getDefaultPhrasebookPack().targetLanguage;
}

function assertPhraseInDefaultPack(phraseId: string): void {
  if (!getPhraseFromDefaultPack(phraseId)) {
    throw new PhraseFavoriteValidationError(PHRASEBOOK_MESSAGES.favoriteFailed);
  }
}

export async function listFavoritePhraseIds(
  userId: string,
  targetLanguage: string,
): Promise<string[]> {
  await connectDb();
  const documents = await PhraseFavorite.find({ userId, targetLanguage })
    .sort({ createdAt: 1, phraseId: 1 })
    .lean();

  return documents.map((document) => document.phraseId);
}

export async function togglePhraseFavorite(input: {
  userId: string;
  packId: string;
  phraseId: string;
}): Promise<{ isFavorite: boolean }> {
  assertPhraseInDefaultPack(input.phraseId);
  const targetLanguage = resolveTargetLanguageFromPack(input.packId);

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
