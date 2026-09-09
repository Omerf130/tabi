import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import {
  TRAVEL_DOCUMENT_CATEGORIES,
  TRAVEL_DOCUMENT_DESCRIPTION_MAX_LENGTH,
  TRAVEL_DOCUMENT_ORIGINAL_FILENAME_MAX_LENGTH,
  TRAVEL_DOCUMENT_TITLE_MAX_LENGTH,
  TRAVEL_DOCUMENT_TITLE_MIN_LENGTH,
} from "@/features/documents/constants";

const travelDocumentSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: TRAVEL_DOCUMENT_CATEGORIES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: TRAVEL_DOCUMENT_TITLE_MIN_LENGTH,
      maxlength: TRAVEL_DOCUMENT_TITLE_MAX_LENGTH,
    },
    description: {
      type: String,
      trim: true,
      maxlength: TRAVEL_DOCUMENT_DESCRIPTION_MAX_LENGTH,
      default: null,
    },
    file: {
      pathname: {
        type: String,
        required: true,
        trim: true,
      },
      contentType: {
        type: String,
        required: true,
        trim: true,
      },
      sizeBytes: {
        type: Number,
        required: true,
        min: 1,
      },
      originalFilename: {
        type: String,
        trim: true,
        maxlength: TRAVEL_DOCUMENT_ORIGINAL_FILENAME_MAX_LENGTH,
        default: null,
      },
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      default: null,
    },
    accommodationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accommodation",
      default: null,
    },
    transportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
      default: null,
    },
    showInEmergency: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
);

travelDocumentSchema.index({ tripId: 1, category: 1, createdAt: -1 });
travelDocumentSchema.index({ tripId: 1, showInEmergency: 1, createdAt: -1 });

travelDocumentSchema.pre("validate", function validateSingleContextLink() {
  const linkCount = [this.activityId, this.accommodationId, this.transportId].filter(
    Boolean,
  ).length;
  if (linkCount > 1) {
    this.invalidate(
      "activityId",
      "A document may link to one context item only",
    );
  }
});

export type TravelDocumentRecord = InferSchemaType<typeof travelDocumentSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const TravelDocument: Model<TravelDocumentRecord> =
  (mongoose.models.TravelDocument as Model<TravelDocumentRecord> | undefined) ??
  mongoose.model<TravelDocumentRecord>("TravelDocument", travelDocumentSchema);
