import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteLinkedTripExpenseForSource,
  resolveTransportExpenseCategory,
  syncLinkedTripExpense,
  updateLinkedTripExpenseFromFinance,
  removeLinkedTripExpenseCost,
} from "./finance-linked-expense-domain";

const tripId = "507f1f77bcf86cd799439011";
const sourceId = "507f1f77bcf86cd799439012";
const expenseId = "507f1f77bcf86cd799439013";

const {
  connectDbMock,
  expenseCreateMock,
  expenseFindOneMock,
  expenseFindOneAndUpdateMock,
  expenseDeleteOneMock,
  transportFindOneMock,
  getOrCreateTripFinanceSettingsMock,
  buildExpenseConversionSnapshotMock,
  getSupportedCurrenciesMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  expenseCreateMock: vi.fn(),
  expenseFindOneMock: vi.fn(),
  expenseFindOneAndUpdateMock: vi.fn(),
  expenseDeleteOneMock: vi.fn(),
  transportFindOneMock: vi.fn(),
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

vi.mock("@/models/Transport", () => ({
  Transport: {
    findOne: transportFindOneMock,
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
const snapshot = {
  originalAmount: 4200,
  originalCurrency: "JPY",
  baseAmount: 95,
  baseCurrency: "ILS",
  exchangeRate: 0.022,
  exchangeRateDate: "2026-10-26",
};

describe("finance linked expense domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupportedCurrenciesMock.mockResolvedValue(supportedCurrencies);
    getOrCreateTripFinanceSettingsMock.mockResolvedValue({
      id: "settings-1",
      tripId,
      baseCurrency: "ILS",
      budgetAmount: null,
    });
    buildExpenseConversionSnapshotMock.mockResolvedValue(snapshot);
    expenseCreateMock.mockResolvedValue(undefined);
    expenseFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
      session: vi.fn().mockReturnThis(),
    });
    expenseFindOneAndUpdateMock.mockResolvedValue({});
    expenseDeleteOneMock.mockResolvedValue({ deletedCount: 1 });
    transportFindOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ type: "flight" }),
      }),
    });
  });

  it("does nothing when cost is cleared and no expense exists", async () => {
    await syncLinkedTripExpense({
      tripId,
      sourceType: "activity",
      sourceId,
      category: "activities",
      expenseDate: "2026-10-26",
      cost: null,
    });
    expect(expenseCreateMock).not.toHaveBeenCalled();
    expect(expenseDeleteOneMock).not.toHaveBeenCalled();
  });

  it("creates linked activity expense", async () => {
    await syncLinkedTripExpense({
      tripId,
      sourceType: "activity",
      sourceId,
      category: "activities",
      expenseDate: "2026-10-26",
      cost: { amount: 4200, currency: "JPY" },
    });
    expect(expenseCreateMock).toHaveBeenCalled();
    expect(buildExpenseConversionSnapshotMock).toHaveBeenCalled();
  });

  it("updates same linked expense when cost changes", async () => {
    expenseFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: expenseId,
        originalAmount: 4200,
        originalCurrency: "JPY",
        baseAmount: 95,
        baseCurrency: "ILS",
        exchangeRate: 0.022,
        exchangeRateDate: "2026-10-26",
      }),
      session: vi.fn().mockReturnThis(),
    });

    await syncLinkedTripExpense({
      tripId,
      sourceType: "activity",
      sourceId,
      category: "food",
      expenseDate: "2026-10-26",
      cost: { amount: 4500, currency: "JPY" },
    });

    expect(expenseFindOneAndUpdateMock).toHaveBeenCalled();
    expect(buildExpenseConversionSnapshotMock).toHaveBeenCalled();
  });

  it("avoids reconversion when only category changes", async () => {
    expenseFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: expenseId,
        originalAmount: 4200,
        originalCurrency: "JPY",
        baseAmount: 95,
        baseCurrency: "ILS",
        exchangeRate: 0.022,
        exchangeRateDate: "2026-10-26",
      }),
      session: vi.fn().mockReturnThis(),
    });

    await syncLinkedTripExpense({
      tripId,
      sourceType: "activity",
      sourceId,
      category: "shopping",
      expenseDate: "2026-10-26",
      cost: { amount: 4200, currency: "JPY" },
    });

    expect(buildExpenseConversionSnapshotMock).not.toHaveBeenCalled();
    expect(expenseFindOneAndUpdateMock).toHaveBeenCalled();
  });

  it("deletes linked expense when cost cleared", async () => {
    expenseFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: expenseId }),
      session: vi.fn().mockReturnThis(),
    });

    await syncLinkedTripExpense({
      tripId,
      sourceType: "activity",
      sourceId,
      category: "activities",
      expenseDate: "2026-10-26",
      cost: null,
    });

    expect(expenseDeleteOneMock).toHaveBeenCalled();
  });

  it("maps flight transport to flights category", () => {
    expect(resolveTransportExpenseCategory("flight")).toBe("flights");
    expect(resolveTransportExpenseCategory("train")).toBe("transport");
  });

  it("removes linked cost without deleting source entity semantics", async () => {
    expenseFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: expenseId,
        sourceType: "activity",
        sourceId,
      }),
    });

    await removeLinkedTripExpenseCost(tripId, expenseId);
    expect(expenseDeleteOneMock).toHaveBeenCalled();
  });

  it("updates linked expense from finance for activity category", async () => {
    expenseFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: expenseId,
        sourceType: "activity",
        sourceId,
        category: "activities",
        expenseDate: "2026-10-26",
        originalAmount: 4200,
        originalCurrency: "JPY",
        baseAmount: 95,
        baseCurrency: "ILS",
        exchangeRate: 0.022,
        exchangeRateDate: "2026-10-26",
      }),
    });

    await updateLinkedTripExpenseFromFinance({
      tripId,
      expenseId,
      amount: 4500,
      currency: "JPY",
      category: "food",
    });

    expect(expenseFindOneAndUpdateMock).toHaveBeenCalled();
  });

  it("deletes linked expense by source", async () => {
    await deleteLinkedTripExpenseForSource(tripId, "accommodation", sourceId);
    expect(expenseDeleteOneMock).toHaveBeenCalledWith({
      tripId,
      sourceType: "accommodation",
      sourceId,
    });
  });
});
