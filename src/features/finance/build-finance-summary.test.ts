import { describe, expect, it } from "vitest";
import { buildFinanceSummary } from "./build-finance-summary";
import type { PublicTripExpense, PublicTripFinanceSettings } from "./types";

const settings: PublicTripFinanceSettings = {
  id: "settings-1",
  tripId: "trip-1",
  baseCurrency: "ILS",
  budgetAmount: null,
};

function expense(
  overrides: Partial<PublicTripExpense> & Pick<PublicTripExpense, "id">,
): PublicTripExpense {
  return {
    tripId: "trip-1",
    sourceType: "manual",
    sourceId: null,
    category: "food",
    title: "Coffee",
    originalAmount: 100,
    originalCurrency: "ILS",
    baseAmount: 100,
    baseCurrency: "ILS",
    exchangeRate: 1,
    exchangeRateDate: "2026-10-01",
    expenseDate: "2026-10-01",
    notes: null,
    createdAt: "2026-10-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("buildFinanceSummary", () => {
  it("returns empty totals when there are no expenses", () => {
    const summary = buildFinanceSummary({ settings, expenses: [] });

    expect(summary.totalExpenses).toBe(0);
    expect(summary.budgetAmount).toBeNull();
    expect(summary.remainingBudget).toBeNull();
    expect(summary.percentConsumed).toBeNull();
    expect(summary.byCategory).toEqual([]);
    expect(summary.recentExpenses).toEqual([]);
  });

  it("calculates totals without a budget", () => {
    const summary = buildFinanceSummary({
      settings,
      expenses: [
        expense({ id: "1", baseAmount: 120, category: "food" }),
        expense({
          id: "2",
          baseAmount: 80,
          category: "transport",
          expenseDate: "2026-10-02",
          createdAt: "2026-10-02T10:00:00.000Z",
        }),
      ],
    });

    expect(summary.totalExpenses).toBe(200);
    expect(summary.remainingBudget).toBeNull();
    expect(summary.percentConsumed).toBeNull();
    expect(summary.byCategory).toEqual([
      { category: "food", label: "אוכל", total: 120 },
      { category: "transport", label: "תחבורה", total: 80 },
    ]);
  });

  it("calculates budget, remaining, and percent consumed", () => {
    const summary = buildFinanceSummary({
      settings: { ...settings, budgetAmount: 1000 },
      expenses: [expense({ id: "1", baseAmount: 400 })],
    });

    expect(summary.totalExpenses).toBe(400);
    expect(summary.remainingBudget).toBe(600);
    expect(summary.percentConsumed).toBe(40);
  });

  it("allows negative remaining and percent above 100", () => {
    const summary = buildFinanceSummary({
      settings: { ...settings, budgetAmount: 1000 },
      expenses: [expense({ id: "1", baseAmount: 1500 })],
    });

    expect(summary.remainingBudget).toBe(-500);
    expect(summary.percentConsumed).toBe(150);
  });

  it("orders recent expenses by expenseDate then createdAt", () => {
    const summary = buildFinanceSummary({
      settings,
      expenses: [
        expense({
          id: "older",
          expenseDate: "2026-10-01",
          createdAt: "2026-10-01T12:00:00.000Z",
        }),
        expense({
          id: "newer-same-day",
          expenseDate: "2026-10-01",
          createdAt: "2026-10-01T18:00:00.000Z",
        }),
        expense({
          id: "latest-day",
          expenseDate: "2026-10-03",
          createdAt: "2026-10-03T08:00:00.000Z",
        }),
      ],
    });

    expect(summary.recentExpenses.map((entry) => entry.id)).toEqual([
      "latest-day",
      "newer-same-day",
      "older",
    ]);
  });
});
