import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createManualTripExpense,
  deleteManualTripExpense,
  FinanceExpenseForbiddenError,
  FinanceExpenseNotFoundError,
  updateManualTripExpense,
} from "./finance-expense-domain";

const tripId = "507f1f77bcf86cd799439011";
const expenseId = "507f1f77bcf86cd799439012";

const {
  connectDbMock,
  expenseCreateMock,
  expenseFindOneMock,
  expenseFindOneAndUpdateMock,
  expenseDeleteOneMock,
  getOrCreateTripFinanceSettingsMock,
  buildExpenseConversionSnapshotMock,
  getSupportedCurrenciesMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  expenseCreateMock: vi.fn(),
  expenseFindOneMock: vi.fn(),
  expenseFindOneAndUpdateMock: vi.fn(),
  expenseDeleteOneMock: vi.fn(),
  getOrCreateTripFinanceSettingsMock: vi.fn(),
  buildExpenseConversionSnapshotMock: vi.fn(),
  getSupportedCurrenciesMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("@/models/TripExpense", () => ({
  TripExpense: {
    create: expenseCreateMock,
    findOne: expenseFindOneMock,
    findOneAndUpdate: expenseFindOneAndUpdateMock,
    deleteOne: expenseDeleteOneMock,
  },
}));

vi.mock("./finance-settings-domain", () => ({
  getOrCreateTripFinanceSettings: getOrCreateTripFinanceSettingsMock,
}));

vi.mock("./finance-conversion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./finance-conversion")>();
  return {
    ...actual,
    buildExpenseConversionSnapshot: buildExpenseConversionSnapshotMock,
  };
});

vi.mock("@/features/currency/queries", () => ({
  getSupportedCurrencies: getSupportedCurrenciesMock,
}));

const supportedCurrencies = [{ code: "ILS" }, { code: "JPY" }, { code: "USD" }];

describe("finance expense domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupportedCurrenciesMock.mockResolvedValue(supportedCurrencies);
    getOrCreateTripFinanceSettingsMock.mockResolvedValue({
      id: "settings-1",
      tripId,
      baseCurrency: "ILS",
      budgetAmount: null,
    });
    buildExpenseConversionSnapshotMock.mockResolvedValue({
      originalAmount: 8400,
      originalCurrency: "JPY",
      baseAmount: 185,
      baseCurrency: "ILS",
      exchangeRate: 0.022,
      exchangeRateDate: "2026-10-26",
    });
    expenseCreateMock.mockResolvedValue({ _id: { toString: () => expenseId } });
    expenseFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: expenseId,
        sourceType: "manual",
        originalAmount: 8400,
        originalCurrency: "JPY",
        baseAmount: 185,
        baseCurrency: "ILS",
        exchangeRate: 0.022,
        exchangeRateDate: "2026-10-26",
      }),
    });
    expenseFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: expenseId }),
    });
    expenseDeleteOneMock.mockResolvedValue({ deletedCount: 1 });
  });

  it("creates manual expenses with conversion snapshots", async () => {
    const id = await createManualTripExpense({
      tripId,
      title: "Sushi Dai",
      category: "food",
      expenseDate: "2026-10-26",
      amount: 8400,
      currency: "JPY",
    });

    expect(id).toBe(expenseId);
    expect(buildExpenseConversionSnapshotMock).toHaveBeenCalled();
    expect(expenseCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: "manual",
        sourceId: null,
        title: "Sushi Dai",
      }),
    );
  });

  it("uses same-currency conversion without calling provider through snapshot helper", async () => {
    buildExpenseConversionSnapshotMock.mockResolvedValueOnce({
      originalAmount: 100,
      originalCurrency: "ILS",
      baseAmount: 100,
      baseCurrency: "ILS",
      exchangeRate: 1,
      exchangeRateDate: "2026-10-26",
    });

    await createManualTripExpense({
      tripId,
      title: "Coffee",
      category: "food",
      expenseDate: "2026-10-26",
      amount: 100,
      currency: "ILS",
    });

    expect(buildExpenseConversionSnapshotMock).toHaveBeenCalledWith(
      expect.objectContaining({
        originalCurrency: "ILS",
        baseCurrency: "ILS",
      }),
    );
  });

  it("updates the same expense without reconversion when money is unchanged", async () => {
    await updateManualTripExpense({
      tripId,
      expenseId,
      title: "Sushi Dai Updated",
      category: "food",
      expenseDate: "2026-10-26",
      amount: 8400,
      currency: "JPY",
    });

    expect(buildExpenseConversionSnapshotMock).not.toHaveBeenCalled();
    expect(expenseFindOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: expenseId, tripId, sourceType: "manual" },
      expect.objectContaining({
        title: "Sushi Dai Updated",
        baseAmount: 185,
      }),
      { new: true },
    );
  });

  it("recalculates conversion when amount changes", async () => {
    await updateManualTripExpense({
      tripId,
      expenseId,
      title: "Sushi Dai",
      category: "food",
      expenseDate: "2026-10-26",
      amount: 9000,
      currency: "JPY",
    });

    expect(buildExpenseConversionSnapshotMock).toHaveBeenCalled();
  });

  it("deletes manual expenses", async () => {
    await deleteManualTripExpense(tripId, expenseId);
    expect(expenseDeleteOneMock).toHaveBeenCalledWith({
      _id: expenseId,
      tripId,
      sourceType: "manual",
    });
  });

  it("rejects deleting linked expenses", async () => {
    expenseFindOneMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue({
        _id: expenseId,
        sourceType: "activity",
      }),
    });

    await expect(deleteManualTripExpense(tripId, expenseId)).rejects.toBeInstanceOf(
      FinanceExpenseForbiddenError,
    );
  });

  it("rejects missing expenses for trip isolation", async () => {
    expenseFindOneMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(deleteManualTripExpense(tripId, expenseId)).rejects.toBeInstanceOf(
      FinanceExpenseNotFoundError,
    );
  });
});
