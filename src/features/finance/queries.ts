import "server-only";

import { getSupportedCurrencies } from "@/features/currency/queries";
import { connectDb } from "@/lib/db/connect";
import { TripExpense } from "@/models/TripExpense";
import { buildAfterTripFinanceRecap } from "./build-after-trip-finance-recap";
import { buildFinancePageViewModel } from "./build-finance-page-view-model";
import { buildFinanceSummary } from "./build-finance-summary";
import { buildTravelHubFinanceSummary } from "./build-travel-hub-finance-summary";
import { resolveExpenseSourceTitles } from "./resolve-expense-source-titles";
import {
  getOrCreateTripFinanceSettings,
  tripHasExpenses,
} from "./finance-settings-domain";
import { toPublicTripExpense } from "./public-finance";
import type {
  AfterTripFinanceRecapViewModel,
  FinancePageViewModel,
  FinanceSummary,
  PublicTripExpense,
  PublicTripFinanceSettings,
  TravelHubFinanceSummary,
} from "./types";
export async function listTripExpenses(tripId: string): Promise<PublicTripExpense[]> {
  await connectDb();
  const expenses = await TripExpense.find({ tripId })
    .sort({ expenseDate: -1, createdAt: -1 })
    .lean();

  return expenses.map(toPublicTripExpense);
}

export async function getFinanceSummaryInput(tripId: string): Promise<{
  settings: PublicTripFinanceSettings;
  expenses: PublicTripExpense[];
  summary: FinanceSummary;
  hasExpenses: boolean;
}> {
  const [settings, expenses, hasExpenses] = await Promise.all([
    getOrCreateTripFinanceSettings(tripId),
    listTripExpenses(tripId),
    tripHasExpenses(tripId),
  ]);

  const summary = buildFinanceSummary({ settings, expenses });

  return { settings, expenses, summary, hasExpenses };
}

export async function prepareFinancePage(input: {
  trip: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    coverImage?: unknown;
    coverVisualKey?: string | null;
  };
  isOwner: boolean;
}): Promise<FinancePageViewModel> {
  const [{ settings, expenses, summary, hasExpenses }, currencies] =
    await Promise.all([
      getFinanceSummaryInput(input.trip.id),
      getSupportedCurrencies(),
    ]);

  const titleLookup = await resolveExpenseSourceTitles(input.trip.id, expenses);

  return buildFinancePageViewModel({
    trip: input.trip,
    isOwner: input.isOwner,
    settings,
    summary,
    expenses,
    hasExpenses,
    baseCurrencyLocked: hasExpenses,
    currencies,
    titleLookup,
  });
}

export async function prepareTravelHubFinanceSummary(
  tripId: string,
): Promise<TravelHubFinanceSummary> {
  const { settings, summary, hasExpenses } = await getFinanceSummaryInput(tripId);
  return buildTravelHubFinanceSummary({
    tripId,
    settings,
    summary,
    hasExpenses,
  });
}

export async function prepareAfterTripFinanceRecap(
  tripId: string,
): Promise<AfterTripFinanceRecapViewModel> {
  const { settings, summary, hasExpenses } = await getFinanceSummaryInput(tripId);
  return buildAfterTripFinanceRecap({
    tripId,
    settings,
    summary,
    hasExpenses,
  });
}