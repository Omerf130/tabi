import { buildFinanceHref } from "./constants";
import type { FinanceSummary, PublicTripFinanceSettings } from "./types";
import type { TravelHubFinanceSummary } from "./types";

export function buildTravelHubFinanceSummary(input: {
  tripId: string;
  settings: PublicTripFinanceSettings;
  summary: FinanceSummary;
  hasExpenses: boolean;
}): TravelHubFinanceSummary {
  return {
    href: buildFinanceHref(input.tripId),
    hasBudget: input.settings.budgetAmount !== null,
    hasExpenses: input.hasExpenses,
    baseCurrency: input.summary.baseCurrency,
    totalExpenses: input.summary.totalExpenses,
    budgetAmount: input.summary.budgetAmount,
    remainingBudget: input.summary.remainingBudget,
    percentConsumed: input.summary.percentConsumed,
  };
}
