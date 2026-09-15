import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  HomeCurrencyValidationError,
  updateUserHomeCurrency,
} from "./update-user-home-currency";

const userId = "507f1f77bcf86cd799439011";

const { updateOneMock, getSupportedCurrenciesMock } = vi.hoisted(() => ({
  updateOneMock: vi.fn(),
  getSupportedCurrenciesMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/User", () => ({
  User: {
    updateOne: updateOneMock,
  },
}));

vi.mock("@/features/currency/queries", () => ({
  getSupportedCurrencies: getSupportedCurrenciesMock,
}));

describe("updateUserHomeCurrency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupportedCurrenciesMock.mockResolvedValue([
      { code: "USD" },
      { code: "ILS" },
    ]);
  });

  it("persists normalized supported currency for the session user only", async () => {
    await updateUserHomeCurrency(userId, "usd");
    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: userId },
      { $set: { homeCurrency: "USD" } },
    );
  });

  it("rejects invalid codes", async () => {
    await expect(updateUserHomeCurrency(userId, "US")).rejects.toBeInstanceOf(
      HomeCurrencyValidationError,
    );
  });

  it("rejects unsupported catalog codes", async () => {
    await expect(updateUserHomeCurrency(userId, "XXX")).rejects.toBeInstanceOf(
      HomeCurrencyValidationError,
    );
  });
});
