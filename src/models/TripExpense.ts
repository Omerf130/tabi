import "server-only";

import mongoose, { type InferSchemaType, type Model } from "mongoose";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_SOURCE_TYPES,
} from "@/features/finance/constants";
import { validateTripExpenseInvariants } from "@/features/finance/validate-expense-invariants";

const tripExpenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: EXPENSE_SOURCE_TYPES,
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: null,
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(value: number) {
          return Number.isFinite(value) && value > 0;
        },
        message: "originalAmount must be greater than zero",
      },
    },
    originalCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    baseCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    exchangeRate: {
      type: Number,
      required: true,
      min: 0,
    },
    exchangeRateDate: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidCalendarDateString(value),
        message: "Invalid exchangeRateDate",
      },
    },
    expenseDate: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isValidCalendarDateString(value),
        message: "Invalid expenseDate",
      },
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true },
);

tripExpenseSchema.index({ tripId: 1, expenseDate: -1, createdAt: -1 });
tripExpenseSchema.index({ tripId: 1, category: 1 });
tripExpenseSchema.index(
  { tripId: 1, sourceType: 1, sourceId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceType: { $ne: "manual" } },
  },
);

tripExpenseSchema.pre("validate", function validateExpenseInvariants() {
  validateTripExpenseInvariants({
    sourceType: this.sourceType,
    sourceId: this.sourceId?.toString() ?? null,
    title: this.title,
    originalAmount: this.originalAmount,
    category: this.category,
  });
});

export type TripExpenseDocument = InferSchemaType<typeof tripExpenseSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TripExpense: Model<TripExpenseDocument> =
  (mongoose.models.TripExpense as Model<TripExpenseDocument> | undefined) ??
  mongoose.model<TripExpenseDocument>("TripExpense", tripExpenseSchema);
