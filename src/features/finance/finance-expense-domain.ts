import "server-only";

import mongoose from "mongoose";
import { isSupportedCurrencyCode } from "@/features/currency/currency-metadata";
import { getSupportedCurrencies } from "@/features/currency/queries";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import { connectDb } from "@/lib/db/connect";
import { TripExpense } from "@/models/TripExpense";
import { FINANCE_MESSAGES } from "./constants";
import {
  buildExpenseConversionSnapshot,
  FrankfurterRequestError,
} from "./finance-conversion";
import { getOrCreateTripFinanceSettings } from "./finance-settings-domain";
import type { ExpenseCategory } from "./types";

export { FrankfurterRequestError };

export class FinanceExpenseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinanceExpenseValidationError";
  }
}

export class FinanceExpenseNotFoundError extends Error {
  constructor() {
    super("Expense not found");
    this.name = "FinanceExpenseNotFoundError";
  }
}

export class FinanceExpenseForbiddenError extends Error {
  constructor() {
    super("Expense cannot be modified");
    this.name = "FinanceExpenseForbiddenError";
  }
}

async function assertSupportedCurrency(currency: string): Promise<void> {
  const currencies = await getSupportedCurrencies();
  if (!isSupportedCurrencyCode(currencies, currency)) {
    throw new FinanceExpenseValidationError(FINANCE_MESSAGES.baseCurrencyInvalid);
  }
}

function assertValidExpenseDate(expenseDate: string): void {
  if (!isValidCalendarDateString(expenseDate)) {
    throw new FinanceExpenseValidationError(FINANCE_MESSAGES.validationFailed);
  }
}

async function getManualExpenseOrThrow(tripId: string, expenseId: string) {
  await connectDb();
  const expense = await TripExpense.findOne({ _id: expenseId, tripId }).lean();
  if (!expense) {
    throw new FinanceExpenseNotFoundError();
  }
  if (expense.sourceType !== "manual") {
    throw new FinanceExpenseForbiddenError();
  }
  return expense;
}

export async function createManualTripExpense(input: {
  tripId: string;
  title: string;
  category: ExpenseCategory;
  expenseDate: string;
  amount: number;
  currency: string;
  notes?: string | null;
}): Promise<string> {
  assertValidExpenseDate(input.expenseDate);
  await assertSupportedCurrency(input.currency);

  const settings = await getOrCreateTripFinanceSettings(input.tripId);
  const snapshot = await buildExpenseConversionSnapshot({
    originalAmount: input.amount,
    originalCurrency: input.currency,
    baseCurrency: settings.baseCurrency,
    expenseDate: input.expenseDate,
  });

  await connectDb();
  const created = await TripExpense.create({
    tripId: new mongoose.Types.ObjectId(input.tripId),
    sourceType: "manual",
    sourceId: null,
    category: input.category,
    title: input.title.trim(),
    originalAmount: snapshot.originalAmount,
    originalCurrency: snapshot.originalCurrency,
    baseAmount: snapshot.baseAmount,
    baseCurrency: snapshot.baseCurrency,
    exchangeRate: snapshot.exchangeRate,
    exchangeRateDate: snapshot.exchangeRateDate,
    expenseDate: input.expenseDate,
    notes: input.notes?.trim() || null,
  });

  return created._id.toString();
}

export async function updateManualTripExpense(input: {
  tripId: string;
  expenseId: string;
  title: string;
  category: ExpenseCategory;
  expenseDate: string;
  amount: number;
  currency: string;
  notes?: string | null;
}): Promise<void> {
  assertValidExpenseDate(input.expenseDate);
  await assertSupportedCurrency(input.currency);

  const existing = await getManualExpenseOrThrow(input.tripId, input.expenseId);
  const settings = await getOrCreateTripFinanceSettings(input.tripId);

  const normalizedCurrency = input.currency.trim().toUpperCase();
  const moneyChanged =
    existing.originalAmount !== input.amount ||
    existing.originalCurrency !== normalizedCurrency;

  let conversionFields: {
    originalAmount: number;
    originalCurrency: string;
    baseAmount: number;
    baseCurrency: string;
    exchangeRate: number;
    exchangeRateDate: string;
  };

  if (moneyChanged) {
    const snapshot = await buildExpenseConversionSnapshot({
      originalAmount: input.amount,
      originalCurrency: input.currency,
      baseCurrency: settings.baseCurrency,
      expenseDate: input.expenseDate,
    });
    conversionFields = snapshot;
  } else {
    conversionFields = {
      originalAmount: existing.originalAmount,
      originalCurrency: existing.originalCurrency,
      baseAmount: existing.baseAmount,
      baseCurrency: existing.baseCurrency,
      exchangeRate: existing.exchangeRate,
      exchangeRateDate: existing.exchangeRateDate,
    };
  }

  await connectDb();
  const updated = await TripExpense.findOneAndUpdate(
    { _id: input.expenseId, tripId: input.tripId, sourceType: "manual" },
    {
      title: input.title.trim(),
      category: input.category,
      expenseDate: input.expenseDate,
      notes: input.notes?.trim() || null,
      ...conversionFields,
    },
    { new: true },
  ).lean();

  if (!updated) {
    throw new FinanceExpenseNotFoundError();
  }
}

export async function deleteManualTripExpense(
  tripId: string,
  expenseId: string,
): Promise<void> {
  await getManualExpenseOrThrow(tripId, expenseId);

  await connectDb();
  const result = await TripExpense.deleteOne({
    _id: expenseId,
    tripId,
    sourceType: "manual",
  });

  if (result.deletedCount !== 1) {
    throw new FinanceExpenseNotFoundError();
  }
}
