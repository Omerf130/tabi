import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";

const tripDestinationSchema = new mongoose.Schema(
  {
    googlePlaceId: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    secondaryLabel: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 2,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const tripCoverImageSchema = new mongoose.Schema(
  {
    pathname: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const tripSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    startDate: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidCalendarDateString(value),
        message: "Invalid startDate",
      },
    },
    endDate: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidCalendarDateString(value),
        message: "Invalid endDate",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coverImage: {
      type: tripCoverImageSchema,
      default: null,
    },
    destination: {
      type: tripDestinationSchema,
      default: undefined,
    },
    coverVisualKey: {
      type: String,
      trim: true,
    },
    initializations: {
      type: {
        listsV1: {
          type: Boolean,
          default: false,
        },
      },
      default: () => ({ listsV1: false }),
    },
  },
  { timestamps: true },
);

export type TripDestinationDocument = InferSchemaType<typeof tripDestinationSchema>;
export type TripCoverImageDocument = InferSchemaType<typeof tripCoverImageSchema>;

export type TripDocument = InferSchemaType<typeof tripSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Trip: Model<TripDocument> =
  (mongoose.models.Trip as Model<TripDocument> | undefined) ??
  mongoose.model<TripDocument>("Trip", tripSchema);
