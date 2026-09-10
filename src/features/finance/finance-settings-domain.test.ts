import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  FinanceSettingsNotFoundError,
  FinanceSettingsValidationError,
  getOrCreateTripFinanceSettings,
  getTripFinanceSettings,
  tripHasExpenses,
  updateTripFinanceSettings,
} from "./finance-settings-domain";

const tripId = "507f1f77bcf86cd799439011";

const {
  connectDbMock,
  settingsFindOneMock,
  settingsCreateMock,
  settingsFindOneAndUpdateMock,
  expenseCountDocumentsMock,
  getSupportedCurrenciesMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  settingsFindOneMock: vi.fn(),
  settingsCreateMock: vi.fn(),
  settingsFindOneAndUpdateMock: vi.fn(),
  expenseCountDocumentsMock: vi.fn(),
  getSupportedCurrenciesMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("@/models/TripFinanceSettings", () => ({
  TripFinanceSettings: {
    findOne: settingsFindOneMock,
    create: settingsCreateMock,
    findOneAndUpdate: settingsFindOneAndUpdateMock,
  },
}));

vi.mock("@/models/TripExpense", () => ({
  TripExpense: {
    countDocuments: expenseCountDocumentsMock,
  },
}));

vi.mock("@/features/currency/queries", () => ({
  getSupportedCurrencies: getSupportedCurrenciesMock,
}));

const supportedCurrencies = [{ code: "ILS" }, { code: "USD" }, { code: "JPY" }];

function settingsDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => "settings-1" },
    tripId: { toString: () => tripId },
    baseCurrency: "ILS",
    budgetAmount: null,
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
    updatedAt: new Date("2026-10-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("finance settings domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupportedCurrenciesMock.mockResolvedValue(supportedCurrencies);
    expenseCountDocumentsMock.mockResolvedValue(0);
  });

  it("returns null for legacy trips without settings", async () => {
    settingsFindOneMock.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });

    await expect(getTripFinanceSettings(tripId)).resolves.toBeNull();
  });

  it("lazy creates default ILS settings", async () => {
    settingsFindOneMock.mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) });
    settingsCreateMock.mockResolvedValue(settingsDoc());

    const result = await getOrCreateTripFinanceSettings(tripId);

    expect(settingsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseCurrency: "ILS",
        budgetAmount: null,
      }),
    );
    expect(result.baseCurrency).toBe("ILS");
    expect(result.budgetAmount).toBeNull();
  });

  it("recovers from duplicate-key races during lazy creation", async () => {
    settingsFindOneMock
      .mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(null) })
      .mockReturnValueOnce({ lean: vi.fn().mockResolvedValue(settingsDoc()) });
    settingsCreateMock.mockRejectedValue({ code: 11000 });

    const result = await getOrCreateTripFinanceSettings(tripId);

    expect(result.tripId).toBe(tripId);
    expect(settingsFindOneMock).toHaveBeenCalledTimes(2);
  });

  it("sets and clears optional budget amounts with rounding", async () => {
    settingsFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(settingsDoc()),
    });
    settingsFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(settingsDoc({ budgetAmount: 30000.01 })),
    });

    const updated = await updateTripFinanceSettings({
      tripId,
      budgetAmount: 30000.009,
    });

    expect(updated.budgetAmount).toBe(30000.01);
    expect(settingsFindOneAndUpdateMock).toHaveBeenCalledWith(
      { tripId },
      { budgetAmount: 30000.01 },
      { new: true },
    );

    settingsFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(settingsDoc({ budgetAmount: null })),
    });

    const cleared = await updateTripFinanceSettings({
      tripId,
      clearBudget: true,
    });

    expect(cleared.budgetAmount).toBeNull();
  });

  it("allows base currency change when there are zero expenses", async () => {
    settingsFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(settingsDoc()),
    });
    settingsFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(settingsDoc({ baseCurrency: "USD" })),
    });

    const updated = await updateTripFinanceSettings({
      tripId,
      baseCurrency: "usd",
    });

    expect(updated.baseCurrency).toBe("USD");
  });

  it("rejects base currency change once expenses exist", async () => {
    settingsFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(settingsDoc()),
    });
    expenseCountDocumentsMock.mockResolvedValue(2);

    await expect(
      updateTripFinanceSettings({
        tripId,
        baseCurrency: "USD",
      }),
    ).rejects.toBeInstanceOf(FinanceSettingsValidationError);
  });

  it("rejects unsupported base currencies", async () => {
    settingsFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(settingsDoc()),
    });

    await expect(
      updateTripFinanceSettings({
        tripId,
        baseCurrency: "XXX",
      }),
    ).rejects.toBeInstanceOf(FinanceSettingsValidationError);
  });

  it("throws when updating missing settings", async () => {
    settingsFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(
      updateTripFinanceSettings({ tripId, budgetAmount: 100 }),
    ).rejects.toBeInstanceOf(FinanceSettingsNotFoundError);
  });

  it("reports whether a trip has expenses", async () => {
    expenseCountDocumentsMock.mockResolvedValueOnce(0);
    await expect(tripHasExpenses(tripId)).resolves.toBe(false);

    expenseCountDocumentsMock.mockResolvedValueOnce(3);
    await expect(tripHasExpenses(tripId)).resolves.toBe(true);
  });
});
