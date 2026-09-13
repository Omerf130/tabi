import { formatAppDate } from "@/features/i18n/formatting";
import type { AppLocale } from "@/features/i18n/locale";
import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import { getExpenseCategoryPresentation } from "./category-presentation";
import { buildExpenseRowViewModel } from "./build-expense-row-view-model";
import type { FinanceLabels } from "./finance-labels";
import type {
  FinanceCategoryDonutSegment,
  FinanceHeroViewModel,
  FinancePageViewModel,
  FinanceSummary,
  PublicTripExpense,
  PublicTripFinanceSettings,
} from "./types";
import type { CurrencyOption } from "@/features/currency/types";
import type { ExpenseSourceTitleLookup } from "./resolve-expense-source-titles";

type BuildFinancePageViewModelInput = {
  trip: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    coverImage?: unknown;
    coverVisualKey?: string | null;
  };
  isOwner: boolean;
  settings: PublicTripFinanceSettings;
  summary: FinanceSummary;
  expenses: readonly PublicTripExpense[];
  hasExpenses: boolean;
  baseCurrencyLocked: boolean;
  currencies: readonly CurrencyOption[];
  titleLookup: ExpenseSourceTitleLookup;
  labels: FinanceLabels;
  locale: AppLocale;
};

function buildDonutSegments(
  summary: FinanceSummary,
  labels: FinanceLabels,
): FinanceCategoryDonutSegment[] {
  return summary.byCategory.map((entry) => {
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
}

function formatDateRangeLabel(
  startDate: string,
  endDate: string,
  locale: AppLocale,
): string {
  const formatDate = (value: string) =>
    formatAppDate(value, locale, {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (startDate === endDate) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function buildFinancePageViewModel(
  input: BuildFinancePageViewModelInput,
): FinancePageViewModel {
  const { settings, summary, expenses, hasExpenses, labels, locale } = input;
  const hasBudget = settings.budgetAmount !== null;
  const pageState = hasBudget
    ? ("withBudget" as const)
    : hasExpenses
      ? ("noBudgetWithExpenses" as const)
      : ("noBudgetNoExpenses" as const);

  const visual = resolveTripVisualSrc({
    tripId: input.trip.id,
    hasCoverImage: Boolean(input.trip.coverImage),
    coverVisualKey: input.trip.coverVisualKey,
  });

  const hero: FinanceHeroViewModel = {
    heroImageSrc: visual.imageSrc,
    tripName: input.trip.name,
    dateRangeLabel: formatDateRangeLabel(
      input.trip.startDate,
      input.trip.endDate,
      locale,
    ),
    title: labels.pageTitle,
    subtitle: labels.heroSubtitle,
  };

  const expenseRows = expenses.map((expense) =>
    buildExpenseRowViewModel(
      expense,
      summary.baseCurrency,
      input.titleLookup,
      labels,
      locale,
    ),
  );

  return {
    tripId: input.trip.id,
    isOwner: input.isOwner,
    pageState,
    hero,
    settings,
    summary,
    hasExpenses,
    baseCurrencyLocked: input.baseCurrencyLocked,
    currencies: input.currencies,
    expenseRows,
    recentExpenseRows: summary.recentExpenses.map((expense) =>
      buildExpenseRowViewModel(
        expense,
        summary.baseCurrency,
        input.titleLookup,
        labels,
        locale,
      ),
    ),
    donutSegments: buildDonutSegments(summary, labels),
    isOverBudget:
      summary.remainingBudget !== null && summary.remainingBudget < 0,
  };
}
