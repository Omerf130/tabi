import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";

const tripMemberSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "member"] as const,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

tripMemberSchema.index({ tripId: 1, userId: 1 }, { unique: true });

export type TripMemberDocument = InferSchemaType<typeof tripMemberSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type TripMemberRole = TripMemberDocument["role"];

export const TripMember: Model<TripMemberDocument> =
  (mongoose.models.TripMember as Model<TripMemberDocument> | undefined) ??
  mongoose.model<TripMemberDocument>("TripMember", tripMemberSchema);
