import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
} from "./constants";
import type {
  FinanceSummary,
  PublicTripExpense,
  PublicTripFinanceSettings,
} from "./types";

const RECENT_EXPENSE_LIMIT = 10;

export function buildFinanceSummary(input: {
  settings: PublicTripFinanceSettings;
  expenses: readonly PublicTripExpense[];
}): FinanceSummary {
  const { settings, expenses } = input;
  const baseCurrency = settings.baseCurrency;
  const budgetAmount = settings.budgetAmount;

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.baseAmount, 0);

  const byCategoryMap = new Map<string, number>();
  for (const category of EXPENSE_CATEGORIES) {
    byCategoryMap.set(category, 0);
  }
  for (const expense of expenses) {
    byCategoryMap.set(
      expense.category,
      (byCategoryMap.get(expense.category) ?? 0) + expense.baseAmount,
    );
  }

  const byCategory = EXPENSE_CATEGORIES.map((category) => ({
    category,
    label: EXPENSE_CATEGORY_LABELS[category],
    total: byCategoryMap.get(category) ?? 0,
  })).filter((entry) => entry.total > 0);

  const recentExpenses = [...expenses]
    .sort((a, b) => {
      const byDate = b.expenseDate.localeCompare(a.expenseDate);
      if (byDate !== 0) {
        return byDate;
      }
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, RECENT_EXPENSE_LIMIT);

  if (budgetAmount === null) {
    return {
      baseCurrency,
      budgetAmount: null,
      totalExpenses,
      remainingBudget: null,
      percentConsumed: null,
      byCategory,
      recentExpenses,
    };
  }

  const remainingBudget = budgetAmount - totalExpenses;
  const percentConsumed =
    budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : null;

  return {
    baseCurrency,
    budgetAmount,
    totalExpenses,
    remainingBudget,
    percentConsumed,
    byCategory,
    recentExpenses,
  };
}
