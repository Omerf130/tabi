import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import { isValidWallClockTime } from "@/features/itinerary/time";
import {
  TRANSPORT_BOOKING_REFERENCE_MAX_LENGTH,
  TRANSPORT_LOCATION_CODE_MAX_LENGTH,
  TRANSPORT_LOCATION_NAME_MAX_LENGTH,
  TRANSPORT_NOTES_MAX_LENGTH,
} from "@/features/transport/constants";
import { isSupportedTransportTimezone } from "@/features/transport/timezone-options";
import { TRAIN_CATEGORIES, TRANSPORT_TYPES } from "@/features/transport/transport-types";

const endpointSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: TRANSPORT_LOCATION_NAME_MAX_LENGTH,
    },
    locationCode: {
      type: String,
      trim: true,
      maxlength: TRANSPORT_LOCATION_CODE_MAX_LENGTH,
      default: null,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidCalendarDateString(value),
        message: "Invalid calendar date",
      },
    },
    time: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidWallClockTime(value),
        message: "Invalid wall clock time",
      },
    },
    timezone: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isSupportedTransportTimezone(value),
        message: "Invalid timezone",
      },
    },
  },
  { _id: false },
);

const transportSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TRANSPORT_TYPES,
      required: true,
    },
    departure: {
      type: endpointSchema,
      required: true,
    },
    arrival: {
      type: endpointSchema,
      required: true,
    },
    bookingReference: {
      type: String,
      trim: true,
      maxlength: TRANSPORT_BOOKING_REFERENCE_MAX_LENGTH,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: TRANSPORT_NOTES_MAX_LENGTH,
      default: null,
    },
    details: {
      airline: { type: String, trim: true, default: null },
      flightNumber: { type: String, trim: true, default: null },
      departureTerminal: { type: String, trim: true, default: null },
      arrivalTerminal: { type: String, trim: true, default: null },
      gate: { type: String, trim: true, default: null },
      seat: { type: String, trim: true, default: null },
      trainCategory: { type: String, enum: [...TRAIN_CATEGORIES, null], default: null },
      serviceName: { type: String, trim: true, default: null },
      trainNumber: { type: String, trim: true, default: null },
      carNumber: { type: String, trim: true, default: null },
      seats: { type: String, trim: true, default: null },
      operator: { type: String, trim: true, default: null },
      serviceNumber: { type: String, trim: true, default: null },
      vehicleOrServiceNotes: { type: String, trim: true, default: null },
    },
  },
  { timestamps: true },
);

transportSchema.index({ tripId: 1, type: 1, "departure.date": 1, "departure.time": 1, createdAt: 1 });
transportSchema.index({ tripId: 1, "departure.date": 1 });

export type TransportDocumentRecord = InferSchemaType<typeof transportSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Transport: Model<TransportDocumentRecord> =
  (mongoose.models.Transport as Model<TransportDocumentRecord> | undefined) ??
  mongoose.model<TransportDocumentRecord>("Transport", transportSchema);
