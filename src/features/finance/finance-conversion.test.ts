import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildExpenseConversionSnapshot,
  FrankfurterRequestError,
} from "./finance-conversion";

const { fetchFrankfurterRateMock } = vi.hoisted(() => ({
  fetchFrankfurterRateMock: vi.fn(),
}));

vi.mock("@/features/currency/frankfurter.server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/currency/frankfurter.server")>();
  return {
    ...actual,
    fetchFrankfurterRate: fetchFrankfurterRateMock,
  };
});

describe("buildExpenseConversionSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses rate 1 for same-currency conversions without external calls", async () => {
    const snapshot = await buildExpenseConversionSnapshot({
      originalAmount: 1000.456,
      originalCurrency: "ILS",
      baseCurrency: "ILS",
      expenseDate: "2026-10-01",
    });

    expect(snapshot).toEqual({
      originalAmount: 1000.46,
      originalCurrency: "ILS",
      baseAmount: 1000.46,
      baseCurrency: "ILS",
      exchangeRate: 1,
      exchangeRateDate: "2026-10-01",
    });
    expect(fetchFrankfurterRateMock).not.toHaveBeenCalled();
  });

  it("rounds JPY amounts to zero decimal places", async () => {
    fetchFrankfurterRateMock.mockResolvedValue({
      from: "JPY",
      to: "ILS",
      rate: 0.0196,
      date: "2026-09-09",
    });

    const snapshot = await buildExpenseConversionSnapshot({
      originalAmount: 8400.7,
      originalCurrency: "JPY",
      baseCurrency: "ILS",
      expenseDate: "2026-10-01",
    });

    expect(snapshot.originalAmount).toBe(8401);
    expect(snapshot.baseAmount).toBe(164.66);
    expect(snapshot.exchangeRate).toBe(0.0196);
    expect(snapshot.exchangeRateDate).toBe("2026-09-09");
  });

  it("propagates provider failures for cross-currency conversions", async () => {
    fetchFrankfurterRateMock.mockRejectedValue(
      new FrankfurterRequestError("Provider unavailable"),
    );

    await expect(
      buildExpenseConversionSnapshot({
        originalAmount: 100,
        originalCurrency: "USD",
        baseCurrency: "ILS",
        expenseDate: "2026-10-01",
      }),
    ).rejects.toBeInstanceOf(FrankfurterRequestError);
  });
});
