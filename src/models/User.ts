import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";

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
