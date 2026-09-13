import { formatCurrencyAmount } from "@/features/currency/convert";
import { getExpenseCategoryPresentation } from "./category-presentation";
import { buildFinanceHref } from "./constants";
import type { FinanceLabels } from "./finance-labels";
import type { ExpenseCategory, FinanceSummary, PublicTripFinanceSettings } from "./types";

export type AfterTripFinanceCategoryBar = {
  category: ExpenseCategory;
  label: string;
  total: number;
  color: string;
  percentage: number;
};

export type AfterTripFinanceRecapNoExpenses = {
  variant: "noExpenses";
  href: string;
  title: string;
  message: string;
  ctaLabel: string;
};

export type AfterTripFinanceRecapWithExpenses = {
  variant: "hasExpenses";
  href: string;
  title: string;
  totalExpenses: number;
  totalExpensesLabel: string;
  baseCurrency: string;
  hasBudget: boolean;
  budgetLabel: string | null;
  remainingLabel: string | null;
  remainingHeading: "remaining" | "overBudgetShort" | null;
  isOverBudget: boolean;
  categoryBars: AfterTripFinanceCategoryBar[];
  ctaLabel: string;
};

export type AfterTripFinanceRecapViewModel =
  | AfterTripFinanceRecapNoExpenses
  | AfterTripFinanceRecapWithExpenses;

const MAX_RECAP_CATEGORIES = 5;

export function buildAfterTripFinanceRecap(input: {
  tripId: string;
  settings: PublicTripFinanceSettings;
  summary: FinanceSummary;
  hasExpenses: boolean;
  labels: FinanceLabels;
}): AfterTripFinanceRecapViewModel {
  const href = buildFinanceHref(input.tripId);
  const { labels } = input;

  if (!input.hasExpenses) {
    return {
      variant: "noExpenses",
      href,
      title: labels.pageTitle,
      message: labels.afterNoExpenses,
      ctaLabel: labels.afterOpenFinanceCta,
    };
  }

  const { summary, settings } = input;
  const hasBudget = settings.budgetAmount !== null;
  const isOverBudget =
    summary.remainingBudget !== null && summary.remainingBudget < 0;

  const categoryBars = [...summary.byCategory]
    .sort((left, right) => right.total - left.total)
    .slice(0, MAX_RECAP_CATEGORIES)
    .map((entry) => {
      const presentation = getExpenseCategoryPresentation(entry.category);
      return {
        category: entry.category,
        label: labels.getCategoryLabel(entry.category),
        total: entry.total,
        color: presentation.color,
        percentage:
          summary.totalExpenses > 0
            ? (entry.total / summary.totalExpenses) * 100
            : 0,
      };
    });

  return {
    variant: "hasExpenses",
    href,
    title: labels.afterRecapTitle,
    totalExpenses: summary.totalExpenses,
    totalExpensesLabel: formatCurrencyAmount(
      summary.totalExpenses,
      summary.baseCurrency,
    ),
    baseCurrency: summary.baseCurrency,
    hasBudget,
    budgetLabel:
      hasBudget && summary.budgetAmount !== null
        ? formatCurrencyAmount(summary.budgetAmount, summary.baseCurrency)
        : null,
    remainingLabel:
      hasBudget && summary.remainingBudget !== null
        ? formatCurrencyAmount(
            Math.abs(summary.remainingBudget),
            summary.baseCurrency,
          )
        : null,
    remainingHeading: hasBudget
      ? isOverBudget
        ? "overBudgetShort"
        : "remaining"
      : null,
    isOverBudget,
    categoryBars,
    ctaLabel: labels.afterFullFinanceCta,
  };
}
