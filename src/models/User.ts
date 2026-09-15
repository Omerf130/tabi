import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { MAPS_APPS } from "@/lib/maps/maps-app";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, select: false },
    googleSubject: { type: String, trim: true },
    role: {
      type: String,
      enum: ["user", "admin"] as const,
      default: "user",
      required: true,
    },
    locale: {
      type: String,
      enum: ["he", "en"] as const,
      default: "he",
      required: true,
    },
    homeCurrency: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    preferredMapsApp: {
      type: String,
      enum: MAPS_APPS,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index(
  { googleSubject: 1 },
  {
    unique: true,
    partialFilterExpression: { googleSubject: { $type: "string" } },
  },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument> | undefined) ??
  mongoose.model<UserDocument>("User", userSchema);
