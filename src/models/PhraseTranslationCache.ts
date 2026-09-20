import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import {
  CANONICAL_PHRASE_SOURCE_LANGUAGE,
  PHRASE_TRANSLATION_CONTENT_VERSION,
  PHRASE_TRANSLATION_PROVIDER,
} from "@/features/language/translation/constants";

const phraseTranslationCacheSchema = new mongoose.Schema(
  {
    phraseId: {
      type: String,
      required: true,
      trim: true,
    },
    sourceLanguage: {
      type: String,
      required: true,
      trim: true,
      default: CANONICAL_PHRASE_SOURCE_LANGUAGE,
    },
    targetLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    translatedText: {
      type: String,
      required: true,
      trim: true,
    },
    transliterationLatin: {
      type: String,
      trim: true,
      default: null,
    },
    contentVersion: {
      type: String,
      required: true,
      trim: true,
      default: PHRASE_TRANSLATION_CONTENT_VERSION,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
      default: PHRASE_TRANSLATION_PROVIDER,
    },
  },
  { timestamps: true },
);

phraseTranslationCacheSchema.index(
  {
    phraseId: 1,
    sourceLanguage: 1,
    targetLanguage: 1,
    contentVersion: 1,
  },
  { unique: true },
);

export type PhraseTranslationCacheDocument = InferSchemaType<
  typeof phraseTranslationCacheSchema
> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const PhraseTranslationCache: Model<PhraseTranslationCacheDocument> =
  (mongoose.models.PhraseTranslationCache as
    | Model<PhraseTranslationCacheDocument>
    | undefined) ??
  mongoose.model<PhraseTranslationCacheDocument>(
    "PhraseTranslationCache",
    phraseTranslationCacheSchema,
  );
