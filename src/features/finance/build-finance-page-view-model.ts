import { formatCalendarDateRangeDisplay } from "@/features/trips/calendar-date";
import { resolveTripVisualSrc } from "@/features/destination-visuals/resolve-trip-visual-src";
import { getExpenseCategoryPresentation } from "./category-presentation";
import { buildExpenseRowViewModel } from "./build-expense-row-view-model";
import { FINANCE_MESSAGES, FINANCE_PAGE_TITLE } from "./constants";
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
};

function buildDonutSegments(
  summary: FinanceSummary,
): FinanceCategoryDonutSegment[] {
  return summary.byCategory.map((entry) => {
    const presentation = getExpenseCategoryPresentation(entry.category);
    return {
      category: entry.category,
      label: presentation.label,
      total: entry.total,
      color: presentation.color,
      percentage:
        summary.totalExpenses > 0
          ? (entry.total / summary.totalExpenses) * 100
          : 0,
    };
  });
}

export function buildFinancePageViewModel(
  input: BuildFinancePageViewModelInput,
): FinancePageViewModel {
  const { settings, summary, expenses, hasExpenses } = input;
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
    dateRangeLabel: formatCalendarDateRangeDisplay(
      input.trip.startDate,
      input.trip.endDate,
    ),
    title: FINANCE_PAGE_TITLE,
    subtitle: FINANCE_MESSAGES.heroSubtitle,
  };

  const expenseRows = expenses.map((expense) =>
    buildExpenseRowViewModel(expense, summary.baseCurrency, input.titleLookup),
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
      buildExpenseRowViewModel(expense, summary.baseCurrency, input.titleLookup),
    ),
    donutSegments: buildDonutSegments(summary),
    isOverBudget:
      summary.remainingBudget !== null && summary.remainingBudget < 0,
  };
}
