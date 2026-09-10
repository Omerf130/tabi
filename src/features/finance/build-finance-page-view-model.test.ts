import { describe, expect, it } from "vitest";
import { buildFinancePageViewModel } from "./build-finance-page-view-model";
import type { FinanceSummary, PublicTripExpense, PublicTripFinanceSettings } from "./types";

const trip = {
  id: "507f1f77bcf86cd799439011",
  name: "Japan 2026",
  startDate: "2026-10-25",
  endDate: "2026-11-18",
  coverVisualKey: "japan-01",
};

const settings: PublicTripFinanceSettings = {
  id: "settings-1",
  tripId: trip.id,
  baseCurrency: "ILS",
  budgetAmount: null,
};

const expense: PublicTripExpense = {
  id: "expense-1",
  tripId: trip.id,
  sourceType: "manual",
  sourceId: null,
  category: "food",
  title: "Sushi Dai",
  originalAmount: 100,
  originalCurrency: "ILS",
  baseAmount: 100,
  baseCurrency: "ILS",
  exchangeRate: 1,
  exchangeRateDate: "2026-10-26",
  expenseDate: "2026-10-26",
  notes: null,
  createdAt: "2026-10-26T10:00:00.000Z",
};

const emptyTitleLookup = {
  activities: new Map<string, string>(),
  accommodations: new Map<string, string>(),
  transports: new Map<string, string>(),
};

function summary(overrides: Partial<FinanceSummary> = {}): FinanceSummary {
  return {
    baseCurrency: "ILS",
    budgetAmount: null,
    totalExpenses: 0,
    remainingBudget: null,
    percentConsumed: null,
    byCategory: [],
    recentExpenses: [],
    ...overrides,
  };
}

describe("buildFinancePageViewModel", () => {
  it("builds no-expense state for owners", () => {
    const model = buildFinancePageViewModel({
      trip,
      isOwner: true,
      settings,
      summary: summary(),
      expenses: [],
      hasExpenses: false,
      baseCurrencyLocked: false,
      currencies: [{ code: "ILS", symbol: "₪", englishName: "ILS", hebrewName: "שקל" }],
      titleLookup: emptyTitleLookup,
    });

    expect(model.pageState).toBe("noBudgetNoExpenses");
    expect(model.hero.title).toBe("הכסף בטיול");
    expect(model.donutSegments).toEqual([]);
  });

  it("builds no-budget with expenses state", () => {
    const model = buildFinancePageViewModel({
      trip,
      isOwner: false,
      settings,
      summary: summary({
        totalExpenses: 100,
        byCategory: [{ category: "food", label: "אוכל", total: 100 }],
        recentExpenses: [expense],
      }),
      expenses: [expense],
      hasExpenses: true,
      baseCurrencyLocked: true,
      currencies: [],
      titleLookup: emptyTitleLookup,
    });

    expect(model.pageState).toBe("noBudgetWithExpenses");
    expect(model.recentExpenseRows).toHaveLength(1);
    expect(model.donutSegments).toHaveLength(1);
  });

  it("builds budget state with over-budget flag", () => {
    const model = buildFinancePageViewModel({
      trip,
      isOwner: true,
      settings: { ...settings, budgetAmount: 100 },
      summary: summary({
        budgetAmount: 100,
        totalExpenses: 150,
        remainingBudget: -50,
        percentConsumed: 150,
        byCategory: [{ category: "food", label: "אוכל", total: 150 }],
        recentExpenses: [expense],
      }),
      expenses: [expense],
      hasExpenses: true,
      baseCurrencyLocked: true,
      currencies: [],
      titleLookup: emptyTitleLookup,
    });

    expect(model.pageState).toBe("withBudget");
    expect(model.isOverBudget).toBe(true);
  });
});
