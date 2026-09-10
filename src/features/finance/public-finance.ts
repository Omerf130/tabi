import type {
  PublicTripExpense,
  PublicTripFinanceSettings,
  TripExpenseRecord,
  TripFinanceSettingsRecord,
} from "./types";

export function toPublicTripFinanceSettings(
  settings: TripFinanceSettingsRecord,
): PublicTripFinanceSettings {
  return {
    id: settings._id.toString(),
    tripId: settings.tripId.toString(),
    baseCurrency: settings.baseCurrency,
    budgetAmount:
      settings.budgetAmount === null || settings.budgetAmount === undefined
        ? null
        : settings.budgetAmount,
  };
}

export function toPublicTripExpense(expense: TripExpenseRecord): PublicTripExpense {
  return {
    id: expense._id.toString(),
    tripId: expense.tripId.toString(),
    sourceType: expense.sourceType,
    sourceId: expense.sourceId?.toString() ?? null,
    category: expense.category,
    title: expense.title?.trim() || null,
    originalAmount: expense.originalAmount,
    originalCurrency: expense.originalCurrency,
    baseAmount: expense.baseAmount,
    baseCurrency: expense.baseCurrency,
    exchangeRate: expense.exchangeRate,
    exchangeRateDate: expense.exchangeRateDate,
    expenseDate: expense.expenseDate,
    notes: expense.notes?.trim() || null,
    createdAt: expense.createdAt.toISOString(),
  };
}
