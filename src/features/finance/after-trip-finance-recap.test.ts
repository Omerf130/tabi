import { describe, expect, it } from "vitest";
import { buildAfterTripFinanceRecap } from "./build-after-trip-finance-recap";
import { buildFinanceSummary } from "./build-finance-summary";
import { buildFinanceHref, FINANCE_MESSAGES } from "./constants";
import type { PublicTripFinanceSettings, PublicTripExpense } from "./types";

const tripId = "507f1f77bcf86cd799439011";

function settings(overrides: Partial<PublicTripFinanceSettings> = {}): PublicTripFinanceSettings {
  return {
    id: "settings-1",
    tripId,
    baseCurrency: "ILS",
    budgetAmount: null,
    ...overrides,
  };
}

function expense(
  overrides: Partial<PublicTripExpense> & Pick<PublicTripExpense, "id" | "category" | "baseAmount">,
): PublicTripExpense {
  return {
    tripId,
    sourceType: "manual",
    sourceId: null,
    title: "Expense",
    originalAmount: overrides.baseAmount,
    originalCurrency: "ILS",
    baseCurrency: "ILS",
    exchangeRate: 1,
    exchangeRateDate: "2026-11-01",
    expenseDate: "2026-11-01",
    notes: null,
    createdAt: "2026-11-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("buildAfterTripFinanceRecap", () => {
  it("returns compact no-expense entry with Finance route CTA", () => {
    const recap = buildAfterTripFinanceRecap({
      tripId,
      settings: settings(),
      summary: buildFinanceSummary({ settings: settings(), expenses: [] }),
      hasExpenses: false,
    });

    expect(recap.variant).toBe("noExpenses");
    if (recap.variant !== "noExpenses") {
      return;
    }

    expect(recap.title).toBe(FINANCE_MESSAGES.pageTitle);
    expect(recap.message).toBe(FINANCE_MESSAGES.afterNoExpenses);
    expect(recap.href).toBe(buildFinanceHref(tripId));
    expect(recap.ctaLabel).toBe(FINANCE_MESSAGES.afterOpenFinanceCta);
  });

  it("shows expenses without budget and no fake budget rows", () => {
    const tripSettings = settings();
    const expenses = [expense({ id: "e1", category: "food", baseAmount: 500 })];
    const recap = buildAfterTripFinanceRecap({
      tripId,
      settings: tripSettings,
      summary: buildFinanceSummary({ settings: tripSettings, expenses }),
      hasExpenses: true,
    });

    expect(recap.variant).toBe("hasExpenses");
    if (recap.variant !== "hasExpenses") {
      return;
    }

    expect(recap.title).toBe(FINANCE_MESSAGES.afterRecapTitle);
    expect(recap.totalExpenses).toBe(500);
    expect(recap.hasBudget).toBe(false);
    expect(recap.budgetLabel).toBeNull();
    expect(recap.remainingLabel).toBeNull();
    expect(recap.href).toBe(buildFinanceHref(tripId));
    expect(recap.ctaLabel).toBe(FINANCE_MESSAGES.afterFullFinanceCta);
  });

  it("shows budget, remaining, and category summary with real totals", () => {
    const tripSettings = settings({ budgetAmount: 1000 });
    const expenses = [
      expense({ id: "e1", category: "food", baseAmount: 300 }),
      expense({ id: "e2", category: "transport", baseAmount: 200 }),
    ];
    const recap = buildAfterTripFinanceRecap({
      tripId,
      settings: tripSettings,
      summary: buildFinanceSummary({ settings: tripSettings, expenses }),
      hasExpenses: true,
    });

    expect(recap.variant).toBe("hasExpenses");
    if (recap.variant !== "hasExpenses") {
      return;
    }

    expect(recap.totalExpenses).toBe(500);
    expect(recap.budgetLabel).toMatch(/1,000|1000/);
    expect(recap.remainingHeading).toBe(FINANCE_MESSAGES.remaining);
    expect(recap.isOverBudget).toBe(false);
    expect(recap.categoryBars).toHaveLength(2);
    expect(recap.categoryBars.every((bar) => bar.total > 0)).toBe(true);
    expect(recap.categoryBars[0]?.total).toBeGreaterThanOrEqual(
      recap.categoryBars[1]?.total ?? 0,
    );
  });

  it("marks over-budget state without fake values", () => {
    const recap = buildAfterTripFinanceRecap({
      tripId,
      settings: settings({ budgetAmount: 400 }),
      summary: {
        baseCurrency: "ILS",
        budgetAmount: 400,
        totalExpenses: 500,
        remainingBudget: -100,
        percentConsumed: 125,
        byCategory: [{ category: "food", label: "אוכל", total: 500 }],
        recentExpenses: [],
      },
      hasExpenses: true,
    });

    expect(recap.variant).toBe("hasExpenses");
    if (recap.variant !== "hasExpenses") {
      return;
    }

    expect(recap.isOverBudget).toBe(true);
    expect(recap.remainingHeading).toBe("חריגה");
    expect(recap.remainingLabel).toMatch(/100/);
  });

  it("excludes zero categories from recap bars", () => {
    const recap = buildAfterTripFinanceRecap({
      tripId,
      settings: settings(),
      summary: {
        baseCurrency: "ILS",
        budgetAmount: null,
        totalExpenses: 100,
        remainingBudget: null,
        percentConsumed: null,
        byCategory: [{ category: "food", label: "אוכל", total: 100 }],
        recentExpenses: [],
      },
      hasExpenses: true,
    });

    expect(recap.variant).toBe("hasExpenses");
    if (recap.variant !== "hasExpenses") {
      return;
    }

    expect(recap.categoryBars).toHaveLength(1);
    expect(recap.categoryBars[0]?.category).toBe("food");
  });
});
