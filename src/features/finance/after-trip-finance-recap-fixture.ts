import { buildAfterTripFinanceRecap } from "./build-after-trip-finance-recap";
import { buildFinanceSummary } from "./build-finance-summary";

export function buildTestNoExpensesRecap(tripId = "507f1f77bcf86cd799439011") {
  const settings = {
    id: "settings-1",
    tripId,
    baseCurrency: "ILS",
    budgetAmount: null,
  };

  return buildAfterTripFinanceRecap({
    tripId,
    settings,
    summary: buildFinanceSummary({ settings, expenses: [] }),
    hasExpenses: false,
  });
}
