import "server-only";

import mongoose from "mongoose";
import { isDuplicateKeyError } from "@/features/auth/errors";
import { isSupportedCurrencyCode } from "@/features/currency/currency-metadata";
import { roundForCurrency } from "@/features/currency/convert";
import { getSupportedCurrencies } from "@/features/currency/queries";
import { connectDb } from "@/lib/db/connect";
import { TripExpense } from "@/models/TripExpense";
import { TripFinanceSettings } from "@/models/TripFinanceSettings";
import {
  DEFAULT_BASE_CURRENCY,
  FINANCE_MESSAGES,
} from "./constants";
import { toPublicTripFinanceSettings } from "./public-finance";
import type { PublicTripFinanceSettings } from "./types";

export class FinanceSettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinanceSettingsValidationError";
  }
}

export class FinanceSettingsNotFoundError extends Error {
  constructor() {
    super(FINANCE_MESSAGES.settingsNotFound);
    this.name = "FinanceSettingsNotFoundError";
  }
}

async function assertSupportedBaseCurrency(baseCurrency: string): Promise<void> {
  const currencies = await getSupportedCurrencies();
  if (!isSupportedCurrencyCode(currencies, baseCurrency)) {
    throw new FinanceSettingsValidationError(FINANCE_MESSAGES.baseCurrencyInvalid);
  }
}

export async function getTripFinanceSettings(
  tripId: string,
): Promise<PublicTripFinanceSettings | null> {
  await connectDb();
  const settings = await TripFinanceSettings.findOne({ tripId }).lean();
  if (!settings) {
    return null;
  }
  return toPublicTripFinanceSettings(settings);
}

export async function getOrCreateTripFinanceSettings(
  tripId: string,
): Promise<PublicTripFinanceSettings> {
  await connectDb();

  const existing = await TripFinanceSettings.findOne({ tripId }).lean();
  if (existing) {
    return toPublicTripFinanceSettings(existing);
  }

  try {
    const created = await TripFinanceSettings.create({
      tripId: new mongoose.Types.ObjectId(tripId),
      baseCurrency: DEFAULT_BASE_CURRENCY,
      budgetAmount: null,
    });
    return toPublicTripFinanceSettings(created);
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const recovered = await TripFinanceSettings.findOne({ tripId }).lean();
    if (!recovered) {
      throw error;
    }
    return toPublicTripFinanceSettings(recovered);
  }
}

export async function tripHasExpenses(tripId: string): Promise<boolean> {
  await connectDb();
  const count = await TripExpense.countDocuments({ tripId });
  return count > 0;
}

export async function updateTripFinanceSettings(input: {
  tripId: string;
  baseCurrency?: string;
  budgetAmount?: number | null;
  clearBudget?: boolean;
}): Promise<PublicTripFinanceSettings> {
  await connectDb();

  const settings = await TripFinanceSettings.findOne({ tripId: input.tripId }).lean();
  if (!settings) {
    throw new FinanceSettingsNotFoundError();
  }

  const update: {
    baseCurrency?: string;
    budgetAmount?: number | null;
  } = {};

  if (input.baseCurrency !== undefined) {
    const normalized = input.baseCurrency.trim().toUpperCase();
    await assertSupportedBaseCurrency(normalized);

    if (normalized !== settings.baseCurrency) {
      const hasExpenses = await tripHasExpenses(input.tripId);
      if (hasExpenses) {
        throw new FinanceSettingsValidationError(FINANCE_MESSAGES.baseCurrencyLocked);
      }
      update.baseCurrency = normalized;
    }
  }

  if (input.clearBudget) {
    update.budgetAmount = null;
  } else if (input.budgetAmount !== undefined) {
    if (input.budgetAmount === null) {
      update.budgetAmount = null;
    } else {
      const baseCurrency = update.baseCurrency ?? settings.baseCurrency;
      update.budgetAmount = roundForCurrency(input.budgetAmount, baseCurrency);
    }
  }

  if (Object.keys(update).length === 0) {
    return toPublicTripFinanceSettings(settings);
  }

  const updated = await TripFinanceSettings.findOneAndUpdate(
    { tripId: input.tripId },
    update,
    { new: true },
  ).lean();

  if (!updated) {
    throw new FinanceSettingsNotFoundError();
  }

  return toPublicTripFinanceSettings(updated);
}
