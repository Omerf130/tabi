import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import {
  ACCOMMODATION_ADDRESS_MAX_LENGTH,
  ACCOMMODATION_BOOKING_REFERENCE_MAX_LENGTH,
  ACCOMMODATION_CITY_MAX_LENGTH,
  ACCOMMODATION_GOOGLE_MAPS_URL_MAX_LENGTH,
  ACCOMMODATION_NAME_JAPANESE_MAX_LENGTH,
  ACCOMMODATION_NAME_MAX_LENGTH,
  ACCOMMODATION_NOTES_MAX_LENGTH,
  ACCOMMODATION_PLACE_ID_MAX_LENGTH,
} from "@/features/accommodations/constants";

const calendarDateField = {
  type: String,
  required: true,
  validate: {
    validator: (value: string) => isValidCalendarDateString(value),
    message: "Invalid calendar date",
  },
};

const accommodationSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    placeSource: {
      type: String,
      enum: ["google", "manual"],
      default: "manual",
      required: true,
    },
    googlePlaceId: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_PLACE_ID_MAX_LENGTH,
    },
    manualName: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_NAME_MAX_LENGTH,
    },
    manualNameJapanese: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_NAME_JAPANESE_MAX_LENGTH,
    },
    manualCity: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_CITY_MAX_LENGTH,
    },
    manualAddressEnglish: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_ADDRESS_MAX_LENGTH,
    },
    manualAddressJapanese: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_ADDRESS_MAX_LENGTH,
    },
    manualGoogleMapsUrl: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_GOOGLE_MAPS_URL_MAX_LENGTH,
    },
    /** @deprecated Legacy Phase 9 fields — read via legacy fallback only. */
    name: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_NAME_MAX_LENGTH,
    },
    nameJapanese: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_NAME_JAPANESE_MAX_LENGTH,
    },
    city: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_CITY_MAX_LENGTH,
    },
    checkInDate: calendarDateField,
    checkOutDate: calendarDateField,
    addressEnglish: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_ADDRESS_MAX_LENGTH,
    },
    addressJapanese: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_ADDRESS_MAX_LENGTH,
    },
    googleMapsUrl: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_GOOGLE_MAPS_URL_MAX_LENGTH,
    },
    bookingReference: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_BOOKING_REFERENCE_MAX_LENGTH,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: ACCOMMODATION_NOTES_MAX_LENGTH,
    },
  },
  { timestamps: true },
);

accommodationSchema.index({ tripId: 1, checkInDate: 1, _id: 1 });

export type AccommodationDocument = InferSchemaType<typeof accommodationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Accommodation: Model<AccommodationDocument> =
  (mongoose.models.Accommodation as Model<AccommodationDocument> | undefined) ??
  mongoose.model<AccommodationDocument>("Accommodation", accommodationSchema);
