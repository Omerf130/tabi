import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";

const phraseFavoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    phraseId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

phraseFavoriteSchema.index(
  { userId: 1, targetLanguage: 1, phraseId: 1 },
  { unique: true },
);
phraseFavoriteSchema.index({ userId: 1, targetLanguage: 1, createdAt: 1 });

export type PhraseFavoriteDocument = InferSchemaType<typeof phraseFavoriteSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const PhraseFavorite: Model<PhraseFavoriteDocument> =
  (mongoose.models.PhraseFavorite as Model<PhraseFavoriteDocument> | undefined) ??
  mongoose.model<PhraseFavoriteDocument>("PhraseFavorite", phraseFavoriteSchema);
