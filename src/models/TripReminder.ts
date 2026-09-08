import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import { isValidWallClockTime } from "@/features/itinerary/time";
import { TRIP_REMINDER_TEXT_MAX_LENGTH } from "@/features/trips/reminders/constants";

const tripReminderSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidCalendarDateString(value),
        message: "Invalid reminder date",
      },
    },
    time: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidWallClockTime(value),
        message: "Invalid reminder time",
      },
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: TRIP_REMINDER_TEXT_MAX_LENGTH,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true },
);

tripReminderSchema.index({ tripId: 1, userId: 1, date: 1, time: 1 });
tripReminderSchema.index({ userId: 1, tripId: 1, isCompleted: 1 });

export type TripReminderDocument = InferSchemaType<typeof tripReminderSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TripReminder: Model<TripReminderDocument> =
  (mongoose.models.TripReminder as Model<TripReminderDocument> | undefined) ??
  mongoose.model<TripReminderDocument>("TripReminder", tripReminderSchema);
