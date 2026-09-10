import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import { ACTIVITY_TYPES } from "@/features/itinerary/activity-types";
import { isValidWallClockTime } from "@/features/itinerary/time";
import {
  ACTIVITY_ADDRESS_MAX_LENGTH,
  ACTIVITY_CITY_MAX_LENGTH,
  ACTIVITY_COUNTRY_MAX_LENGTH,
  ACTIVITY_GOOGLE_MAPS_URL_MAX_LENGTH,
  ACTIVITY_LOCATION_MAX_LENGTH,
  ACTIVITY_NOTES_MAX_LENGTH,
  ACTIVITY_TITLE_MAX_LENGTH,
  ACTIVITY_TITLE_MIN_LENGTH,
} from "@/features/itinerary/constants";
import { ACTIVITY_PLACE_SOURCES } from "@/features/itinerary/activity-place-types";

const activitySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidCalendarDateString(value),
        message: "Invalid activity date",
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: ACTIVITY_TITLE_MIN_LENGTH,
      maxlength: ACTIVITY_TITLE_MAX_LENGTH,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    startTime: {
      type: String,
      default: null,
      validate: {
        validator(value: string | null) {
          return value === null || value === undefined || isValidWallClockTime(value);
        },
        message: "Invalid startTime",
      },
    },
    endTime: {
      type: String,
      default: null,
      validate: {
        validator(value: string | null) {
          return value === null || value === undefined || isValidWallClockTime(value);
        },
        message: "Invalid endTime",
      },
    },
    placeSource: {
      type: String,
      enum: ACTIVITY_PLACE_SOURCES,
      default: null,
    },
    googlePlaceId: {
      type: String,
      trim: true,
      default: null,
    },
    locationName: {
      type: String,
      trim: true,
      maxlength: ACTIVITY_LOCATION_MAX_LENGTH,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      maxlength: ACTIVITY_ADDRESS_MAX_LENGTH,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      maxlength: ACTIVITY_CITY_MAX_LENGTH,
      default: null,
    },
    country: {
      type: String,
      trim: true,
      maxlength: ACTIVITY_COUNTRY_MAX_LENGTH,
      default: null,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    googleMapsUrl: {
      type: String,
      trim: true,
      maxlength: ACTIVITY_GOOGLE_MAPS_URL_MAX_LENGTH,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: ACTIVITY_NOTES_MAX_LENGTH,
      default: null,
    },
  },
  { timestamps: true },
);

activitySchema.index({ tripId: 1, date: 1, order: 1 });

export type ActivityDocument = InferSchemaType<typeof activitySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Activity: Model<ActivityDocument> =
  (mongoose.models.Activity as Model<ActivityDocument> | undefined) ??
  mongoose.model<ActivityDocument>("Activity", activitySchema);
