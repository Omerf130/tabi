import { describe, expect, it } from "vitest";
import { buildExpenseRowViewModel } from "./build-expense-row-view-model";
import type { PublicTripExpense } from "./types";

const baseExpense: PublicTripExpense = {
  id: "expense-1",
  tripId: "trip-1",
  sourceType: "manual",
  sourceId: null,
  category: "food",
  title: "Sushi Dai",
  originalAmount: 8400,
  originalCurrency: "JPY",
  baseAmount: 185,
  baseCurrency: "ILS",
  exchangeRate: 0.022,
  exchangeRateDate: "2026-10-26",
  expenseDate: "2026-10-26",
  notes: null,
  createdAt: "2026-10-26T10:00:00.000Z",
};

const emptyLookup = {
  activities: new Map<string, string>(),
  accommodations: new Map<string, string>(),
  transports: new Map<string, string>(),
};

describe("buildExpenseRowViewModel", () => {
  it("shows base equivalent for cross-currency rows", () => {
    const row = buildExpenseRowViewModel(baseExpense, "ILS", emptyLookup);
    expect(row.showBaseEquivalent).toBe(true);
    expect(row.originalAmountLabel).toContain("8");
    expect(row.baseAmountLabel).toContain("185");
  });

  it("hides duplicate equivalent for same-currency rows", () => {
    const row = buildExpenseRowViewModel(
      {
        ...baseExpense,
        originalCurrency: "ILS",
        baseCurrency: "ILS",
        originalAmount: 100,
        baseAmount: 100,
      },
      "ILS",
      emptyLookup,
    );

    expect(row.showBaseEquivalent).toBe(false);
    expect(row.isLinked).toBe(false);
  });

  it("marks linked rows and resolves activity titles", () => {
    const lookup = {
      ...emptyLookup,
      activities: new Map([["act-1", "TeamLab Planets"]]),
    };
    const row = buildExpenseRowViewModel(
      {
        ...baseExpense,
        sourceType: "activity",
        sourceId: "act-1",
        title: null,
        category: "activities",
      },
      "ILS",
      lookup,
    );

    expect(row.isLinked).toBe(true);
    expect(row.title).toBe("TeamLab Planets");
    expect(row.categoryEditable).toBe(true);
  });
});
