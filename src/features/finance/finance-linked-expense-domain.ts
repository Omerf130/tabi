import "server-only";

import mongoose, { type ClientSession } from "mongoose";
import { isSupportedCurrencyCode } from "@/features/currency/currency-metadata";
import { getSupportedCurrencies } from "@/features/currency/queries";
import type { TransportType } from "@/features/transport/transport-types";
import { isValidCalendarDateString } from "@/features/trips/calendar-date";
import { connectDb } from "@/lib/db/connect";
import { Transport } from "@/models/Transport";
import { TripExpense } from "@/models/TripExpense";
import { FINANCE_MESSAGES } from "./constants";
import {
  buildExpenseConversionSnapshot,
  FrankfurterRequestError,
} from "./finance-conversion";
import {
  FinanceExpenseForbiddenError,
  FinanceExpenseNotFoundError,
  FinanceExpenseValidationError,
} from "./finance-expense-domain";
import { getOrCreateTripFinanceSettings } from "./finance-settings-domain";
import type { ActivityCostCategory } from "./entity-cost-schema";
import type { ExpenseCategory, ExpenseSourceType } from "./types";

export { FrankfurterRequestError };

export type LinkedExpenseSourceType = Extract<
  ExpenseSourceType,
  "activity" | "accommodation" | "transport"
>;

export type EntityCostInput = {
  amount: number;
  currency: string;
};

export type SyncLinkedTripExpenseInput = {
  tripId: string;
  sourceType: LinkedExpenseSourceType;
  sourceId: string;
  category: ExpenseCategory;
  expenseDate: string;
  cost: EntityCostInput | null;
  session?: ClientSession;
};

export type LinkedTripExpenseSnapshot = {
  id: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
};

export function resolveTransportExpenseCategory(type: TransportType): ExpenseCategory {
  return type === "flight" ? "flights" : "transport";
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

async function findLinkedExpense(
  tripId: string,
  sourceType: LinkedExpenseSourceType,
  sourceId: string,
  session?: ClientSession,
) {
  await connectDb();
  const query = TripExpense.findOne({ tripId, sourceType, sourceId });
  if (session) {
    query.session(session);
  }
  return query.lean();
}

export async function getLinkedTripExpenseForSource(
  tripId: string,
  sourceType: LinkedExpenseSourceType,
  sourceId: string,
): Promise<LinkedTripExpenseSnapshot | null> {
  const expense = await findLinkedExpense(tripId, sourceType, sourceId);
  if (!expense) {
    return null;
  }

  return {
    id: expense._id.toString(),
    amount: expense.originalAmount,
    currency: expense.originalCurrency,
    category: expense.category,
  };
}

export async function listLinkedTripExpensesForSources(
  tripId: string,
  sourceType: LinkedExpenseSourceType,
  sourceIds: readonly string[],
): Promise<Map<string, LinkedTripExpenseSnapshot>> {
  if (sourceIds.length === 0) {
    return new Map();
  }

  await connectDb();
  const expenses = await TripExpense.find({
    tripId,
    sourceType,
    sourceId: { $in: sourceIds },
  }).lean();

  return new Map(
    expenses.map((expense) => [
      expense.sourceId!.toString(),
      {
        id: expense._id.toString(),
        amount: expense.originalAmount,
        currency: expense.originalCurrency,
        category: expense.category,
      },
    ]),
  );
}

export async function syncLinkedTripExpense(
  input: SyncLinkedTripExpenseInput,
): Promise<void> {
  assertValidExpenseDate(input.expenseDate);

  const existing = await findLinkedExpense(
    input.tripId,
    input.sourceType,
    input.sourceId,
    input.session,
  );

  if (!input.cost) {
    if (!existing) {
      return;
    }
    await connectDb();
    const deleteQuery = TripExpense.deleteOne({ _id: existing._id, tripId: input.tripId });
    if (input.session) {
      deleteQuery.session(input.session);
    }
    await deleteQuery;
    return;
  }

  await assertSupportedCurrency(input.cost.currency);
  const settings = await getOrCreateTripFinanceSettings(input.tripId);
  const normalizedCurrency = input.cost.currency.trim().toUpperCase();

  const moneyChanged =
    !existing ||
    existing.originalAmount !== input.cost.amount ||
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
      originalAmount: input.cost.amount,
      originalCurrency: input.cost.currency,
      baseCurrency: settings.baseCurrency,
      expenseDate: input.expenseDate,
    });
    conversionFields = snapshot;
  } else {
    conversionFields = {
      originalAmount: existing!.originalAmount,
      originalCurrency: existing!.originalCurrency,
      baseAmount: existing!.baseAmount,
      baseCurrency: existing!.baseCurrency,
      exchangeRate: existing!.exchangeRate,
      exchangeRateDate: existing!.exchangeRateDate,
    };
  }

  await connectDb();

  if (!existing) {
    const createQuery = TripExpense.create(
      [
        {
          tripId: new mongoose.Types.ObjectId(input.tripId),
          sourceType: input.sourceType,
          sourceId: new mongoose.Types.ObjectId(input.sourceId),
          category: input.category,
          title: null,
          originalAmount: conversionFields.originalAmount,
          originalCurrency: conversionFields.originalCurrency,
          baseAmount: conversionFields.baseAmount,
          baseCurrency: conversionFields.baseCurrency,
          exchangeRate: conversionFields.exchangeRate,
          exchangeRateDate: conversionFields.exchangeRateDate,
          expenseDate: input.expenseDate,
          notes: null,
        },
      ],
      input.session ? { session: input.session } : undefined,
    );
    await createQuery;
    return;
  }

  const updateQuery = TripExpense.findOneAndUpdate(
    {
      _id: existing._id,
      tripId: input.tripId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
    },
    {
      category: input.category,
      expenseDate: input.expenseDate,
      title: null,
      notes: null,
      ...conversionFields,
    },
    { new: true, ...(input.session ? { session: input.session } : {}) },
  );
  await updateQuery;
}

export async function deleteLinkedTripExpenseForSource(
  tripId: string,
  sourceType: LinkedExpenseSourceType,
  sourceId: string,
  session?: ClientSession,
): Promise<void> {
  await connectDb();
  const deleteQuery = TripExpense.deleteOne({ tripId, sourceType, sourceId });
  if (session) {
    deleteQuery.session(session);
  }
  await deleteQuery;
}

async function getLinkedExpenseByIdOrThrow(tripId: string, expenseId: string) {
  await connectDb();
  const expense = await TripExpense.findOne({ _id: expenseId, tripId }).lean();
  if (!expense) {
    throw new FinanceExpenseNotFoundError();
  }
  if (expense.sourceType === "manual") {
    throw new FinanceExpenseForbiddenError();
  }
  return expense;
}

export async function updateLinkedTripExpenseFromFinance(input: {
  tripId: string;
  expenseId: string;
  amount: number;
  currency: string;
  category?: ActivityCostCategory;
}): Promise<void> {
  const existing = await getLinkedExpenseByIdOrThrow(input.tripId, input.expenseId);

  if (existing.sourceType === "activity") {
    if (!input.category) {
      throw new FinanceExpenseValidationError(FINANCE_MESSAGES.categoryInvalid);
    }
  }

  let category: ExpenseCategory = existing.category;
  if (existing.sourceType === "activity" && input.category) {
    category = input.category;
  } else if (existing.sourceType === "accommodation") {
    category = "accommodation";
  } else if (existing.sourceType === "transport") {
    await connectDb();
    const transport = await Transport.findOne({
      _id: existing.sourceId,
      tripId: input.tripId,
    })
      .select("type")
      .lean();
    if (!transport) {
      throw new FinanceExpenseNotFoundError();
    }
    category = resolveTransportExpenseCategory(transport.type);
  }

  await syncLinkedTripExpense({
    tripId: input.tripId,
    sourceType: existing.sourceType as LinkedExpenseSourceType,
    sourceId: existing.sourceId!.toString(),
    category,
    expenseDate: existing.expenseDate,
    cost: { amount: input.amount, currency: input.currency },
  });
}

export async function removeLinkedTripExpenseCost(
  tripId: string,
  expenseId: string,
): Promise<void> {
  const existing = await getLinkedExpenseByIdOrThrow(tripId, expenseId);
  await deleteLinkedTripExpenseForSource(
    tripId,
    existing.sourceType as LinkedExpenseSourceType,
    existing.sourceId!.toString(),
  );
}
