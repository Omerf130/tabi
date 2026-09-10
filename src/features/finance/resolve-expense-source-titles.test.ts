import { describe, expect, it } from "vitest";
import {
  resolveLinkedExpenseTitle,
  type ExpenseSourceTitleLookup,
} from "./resolve-expense-source-titles";
import type { PublicTripExpense } from "./types";

const emptyLookup: ExpenseSourceTitleLookup = {
  activities: new Map(),
  accommodations: new Map(),
  transports: new Map(),
};

describe("resolve expense source titles", () => {
  it("resolves linked activity title from lookup", () => {
    const lookup: ExpenseSourceTitleLookup = {
      ...emptyLookup,
      activities: new Map([["act-1", "TeamLab Planets"]]),
    };

    const title = resolveLinkedExpenseTitle(
      {
        id: "exp-1",
        tripId: "trip-1",
        sourceType: "activity",
        sourceId: "act-1",
        category: "activities",
        title: null,
        originalAmount: 100,
        originalCurrency: "JPY",
        baseAmount: 2,
        baseCurrency: "ILS",
        exchangeRate: 0.02,
        exchangeRateDate: "2026-10-26",
        expenseDate: "2026-10-26",
        notes: null,
        createdAt: "2026-10-26T10:00:00.000Z",
      } satisfies PublicTripExpense,
      lookup,
    );

    expect(title).toBe("TeamLab Planets");
  });

  it("uses orphan fallback when source missing", () => {
    const title = resolveLinkedExpenseTitle(
      {
        id: "exp-1",
        tripId: "trip-1",
        sourceType: "activity",
        sourceId: "missing",
        category: "activities",
        title: null,
        originalAmount: 100,
        originalCurrency: "JPY",
        baseAmount: 2,
        baseCurrency: "ILS",
        exchangeRate: 0.02,
        exchangeRateDate: "2026-10-26",
        expenseDate: "2026-10-26",
        notes: null,
        createdAt: "2026-10-26T10:00:00.000Z",
      } satisfies PublicTripExpense,
      emptyLookup,
    );

    expect(title).toBe("פריט שנמחק");
  });
});
