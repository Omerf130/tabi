import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";

const tripInvitationSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["owner", "member"] as const,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

tripInvitationSchema.index({ tripId: 1, createdAt: -1 });
tripInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type TripInvitationDocument = InferSchemaType<
  typeof tripInvitationSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export type TripInvitationRole = TripInvitationDocument["role"];

export const TripInvitation: Model<TripInvitationDocument> =
  (mongoose.models.TripInvitation as
    | Model<TripInvitationDocument>
    | undefined) ??
  mongoose.model<TripInvitationDocument>("TripInvitation", tripInvitationSchema);
