import { describe, expect, it } from "vitest";
import {
  createManualExpenseSchema,
  updateManualExpenseSchema,
  updateTripFinanceSettingsSchema,
} from "./schemas";

const tripId = "507f1f77bcf86cd799439011";

describe("updateTripFinanceSettingsSchema", () => {
  it("accepts budget updates and currency changes", () => {
    const parsed = updateTripFinanceSettingsSchema.safeParse({
      tripId,
      budgetAmount: "30000",
      baseCurrency: "ils",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.budgetAmount).toBe(30000);
      expect(parsed.data.baseCurrency).toBe("ILS");
    }
  });

  it("treats empty budget input as clear", () => {
    const parsed = updateTripFinanceSettingsSchema.safeParse({
      tripId,
      budgetAmount: "",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.budgetAmount).toBeNull();
    }
  });

  it("rejects invalid budget amounts and currency codes", () => {
    expect(
      updateTripFinanceSettingsSchema.safeParse({
        tripId,
        budgetAmount: "-5",
      }).success,
    ).toBe(false);

    expect(
      updateTripFinanceSettingsSchema.safeParse({
        tripId,
        baseCurrency: "INVALID",
      }).success,
    ).toBe(false);
  });
});

describe("manual expense schemas", () => {
  it("accepts valid manual expense input", () => {
    const parsed = createManualExpenseSchema.safeParse({
      tripId,
      title: "Sushi Dai",
      category: "food",
      expenseDate: "2026-10-26",
      amount: "8400",
      currency: "jpy",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.currency).toBe("JPY");
      expect(parsed.data.amount).toBe(8400);
    }
  });

  it("requires title and valid category/date", () => {
    expect(
      createManualExpenseSchema.safeParse({
        tripId,
        title: "",
        category: "food",
        expenseDate: "2026-10-26",
        amount: "10",
        currency: "ILS",
      }).success,
    ).toBe(false);

    expect(
      createManualExpenseSchema.safeParse({
        tripId,
        title: "Coffee",
        category: "invalid",
        expenseDate: "2026-10-26",
        amount: "10",
        currency: "ILS",
      }).success,
    ).toBe(false);
  });

  it("allows optional notes on update", () => {
    const parsed = updateManualExpenseSchema.safeParse({
      tripId,
      expenseId: "507f1f77bcf86cd799439012",
      title: "Coffee",
      category: "food",
      expenseDate: "2026-10-26",
      amount: "10",
      currency: "ILS",
      notes: "",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.notes).toBeNull();
    }
  });
});
