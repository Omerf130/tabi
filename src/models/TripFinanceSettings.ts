import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";

const tripFinanceSettingsSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      unique: true,
      index: true,
    },
    baseCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    budgetAmount: {
      type: Number,
      default: null,
      validate: {
        validator(value: number | null | undefined) {
          if (value === null || value === undefined) {
            return true;
          }
          return Number.isFinite(value) && value > 0;
        },
        message: "budgetAmount must be positive when set",
      },
    },
  },
  { timestamps: true },
);

export type TripFinanceSettingsDocument = InferSchemaType<
  typeof tripFinanceSettingsSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const TripFinanceSettings: Model<TripFinanceSettingsDocument> =
  (mongoose.models.TripFinanceSettings as
    | Model<TripFinanceSettingsDocument>
    | undefined) ??
  mongoose.model<TripFinanceSettingsDocument>(
    "TripFinanceSettings",
    tripFinanceSettingsSchema,
  );
