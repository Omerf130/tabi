import { describe, expect, it } from "vitest";
import {
  TripExpenseValidationError,
  validateTripExpenseInvariants,
} from "./validate-expense-invariants";

describe("validateTripExpenseInvariants", () => {
  it("requires amount greater than zero", () => {
    expect(() =>
      validateTripExpenseInvariants({
        sourceType: "manual",
        title: "Coffee",
        originalAmount: 0,
        category: "food",
      }),
    ).toThrow(TripExpenseValidationError);
  });

  it("requires manual title and forbids sourceId", () => {
    expect(() =>
      validateTripExpenseInvariants({
        sourceType: "manual",
        sourceId: "507f1f77bcf86cd799439011",
        title: "Coffee",
        originalAmount: 10,
        category: "food",
      }),
    ).toThrow(TripExpenseValidationError);

    expect(() =>
      validateTripExpenseInvariants({
        sourceType: "manual",
        title: "",
        originalAmount: 10,
        category: "food",
      }),
    ).toThrow(TripExpenseValidationError);
  });

  it("requires linked sourceId and forbids title", () => {
    expect(() =>
      validateTripExpenseInvariants({
        sourceType: "activity",
        sourceId: null,
        originalAmount: 10,
        category: "activities",
      }),
    ).toThrow(TripExpenseValidationError);

    expect(() =>
      validateTripExpenseInvariants({
        sourceType: "activity",
        sourceId: "507f1f77bcf86cd799439011",
        title: "Should not persist",
        originalAmount: 10,
        category: "activities",
      }),
    ).toThrow(TripExpenseValidationError);
  });

  it("accepts valid manual and linked expenses", () => {
    expect(() =>
      validateTripExpenseInvariants({
        sourceType: "manual",
        title: "Souvenir",
        originalAmount: 10,
        category: "shopping",
      }),
    ).not.toThrow();

    expect(() =>
      validateTripExpenseInvariants({
        sourceType: "transport",
        sourceId: "507f1f77bcf86cd799439011",
        originalAmount: 10,
        category: "transport",
      }),
    ).not.toThrow();
  });
});
