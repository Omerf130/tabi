import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionDocument = InferSchemaType<typeof sessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Session: Model<SessionDocument> =
  (mongoose.models.Session as Model<SessionDocument> | undefined) ??
  mongoose.model<SessionDocument>("Session", sessionSchema);
