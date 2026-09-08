import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";

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
  },
  { timestamps: true },
);

export type TripDocument = InferSchemaType<typeof tripSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Trip: Model<TripDocument> =
  (mongoose.models.Trip as Model<TripDocument> | undefined) ??
  mongoose.model<TripDocument>("Trip", tripSchema);
