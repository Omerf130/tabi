import { formatCurrencyAmount } from "@/features/currency/convert";
import { formatAppDate } from "@/features/i18n/formatting";
import type { AppLocale } from "@/features/i18n/locale";
import { getExpenseCategoryPresentation } from "./category-presentation";
import type { FinanceLabels } from "./finance-labels";
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
  labels: FinanceLabels,
  locale: AppLocale,
): ExpenseRowViewModel {
  const presentation = getExpenseCategoryPresentation(expense.category);
  const categoryLabel = labels.getCategoryLabel(expense.category);
  const showBaseEquivalent = expense.originalCurrency !== baseCurrency;
  const isLinked = expense.sourceType !== "manual";
  const title = isLinked
    ? resolveLinkedExpenseTitle(expense, titleLookup, labels)
    : expense.title?.trim() || categoryLabel;

  return {
    id: expense.id,
    title,
    category: expense.category,
    categoryLabel,
    categoryColor: presentation.color,
    categorySoftColor: presentation.softColor,
    expenseDateLabel: formatAppDate(expense.expenseDate, locale, {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
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
    linkedSourceLabel: resolveLinkedExpenseSourceLabel(expense.sourceType, labels),
    categoryEditable: expense.sourceType === "activity",
  };
}
