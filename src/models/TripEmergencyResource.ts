import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { EMERGENCY_CUSTOM_CATEGORIES } from "@/features/emergency/types";

const tripEmergencyResourceSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: EMERGENCY_CUSTOM_CATEGORIES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40,
      default: null,
    },
    secondaryPhone: {
      type: String,
      trim: true,
      maxlength: 40,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      maxlength: 320,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    url: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    reference: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

tripEmergencyResourceSchema.index({ tripId: 1, category: 1, createdAt: 1 });
tripEmergencyResourceSchema.index({ tripId: 1, createdAt: 1 });

export type TripEmergencyResourceDocument = InferSchemaType<
  typeof tripEmergencyResourceSchema
> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const TripEmergencyResource: Model<TripEmergencyResourceDocument> =
  (mongoose.models.TripEmergencyResource as
    | Model<TripEmergencyResourceDocument>
    | undefined) ??
  mongoose.model<TripEmergencyResourceDocument>(
    "TripEmergencyResource",
    tripEmergencyResourceSchema,
  );
