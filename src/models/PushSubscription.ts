import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";

const pushSubscriptionKeysSchema = new mongoose.Schema(
  {
    p256dh: {
      type: String,
      required: true,
      trim: true,
    },
    auth: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keys: {
      type: pushSubscriptionKeysSchema,
      required: true,
    },
    lastSeenAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export type PushSubscriptionDocument = InferSchemaType<
  typeof pushSubscriptionSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const PushSubscription: Model<PushSubscriptionDocument> =
  (mongoose.models.PushSubscription as Model<PushSubscriptionDocument> | undefined) ??
  mongoose.model<PushSubscriptionDocument>(
    "PushSubscription",
    pushSubscriptionSchema,
  );
