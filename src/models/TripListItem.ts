import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import {
  TRIP_LIST_ITEM_TEXT_MAX_LENGTH,
  TRIP_LIST_TYPES,
} from "@/features/lists/constants";

const tripListItemSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    listType: {
      type: String,
      enum: TRIP_LIST_TYPES,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: TRIP_LIST_ITEM_TEXT_MAX_LENGTH,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

tripListItemSchema.index({ tripId: 1, listType: 1, order: 1 });

export type TripListItemDocument = InferSchemaType<typeof tripListItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TripListItem: Model<TripListItemDocument> =
  (mongoose.models.TripListItem as Model<TripListItemDocument> | undefined) ??
  mongoose.model<TripListItemDocument>("TripListItem", tripListItemSchema);
