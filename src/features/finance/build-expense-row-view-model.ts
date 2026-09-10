import { formatCurrencyAmount } from "@/features/currency/convert";
import { formatCalendarDateDisplay } from "@/features/trips/calendar-date";
import { getExpenseCategoryPresentation } from "./category-presentation";
import {
  resolveLinkedExpenseSourceLabel,
  resolveLinkedExpenseTitle,
  type ExpenseSourceTitleLookup,
} from "./resolve-expense-source-titles";
import type { ExpenseRowViewModel, PublicTripExpense } from "./types";

export function buildExpenseRowViewModel(
  expense: PublicTripExpense,
  baseCurrency: string,
  titleLookup: ExpenseSourceTitleLookup,
): ExpenseRowViewModel {
  const presentation = getExpenseCategoryPresentation(expense.category);
  const showBaseEquivalent = expense.originalCurrency !== baseCurrency;
  const isLinked = expense.sourceType !== "manual";
  const title = isLinked
    ? resolveLinkedExpenseTitle(expense, titleLookup)
    : expense.title?.trim() || presentation.label;

  return {
    id: expense.id,
    title,
    category: expense.category,
    categoryLabel: presentation.label,
    categoryColor: presentation.color,
    categorySoftColor: presentation.softColor,
    expenseDateLabel: formatCalendarDateDisplay(expense.expenseDate),
    originalAmountLabel: formatCurrencyAmount(
      expense.originalAmount,
      expense.originalCurrency,
    ),
    baseAmountLabel: formatCurrencyAmount(expense.baseAmount, expense.baseCurrency),
    showBaseEquivalent,
    notes: expense.notes,
    expenseDate: expense.expenseDate,
    originalAmount: expense.originalAmount,
    originalCurrency: expense.originalCurrency,
    sourceType: expense.sourceType,
    sourceId: expense.sourceId,
    isLinked,
    linkedSourceLabel: resolveLinkedExpenseSourceLabel(expense.sourceType),
    categoryEditable: expense.sourceType === "activity",
  };
}
