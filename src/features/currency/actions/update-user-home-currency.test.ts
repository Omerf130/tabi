import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateUserHomeCurrencyAction } from "./update-user-home-currency";

const userId = "507f1f77bcf86cd799439011";

const { requireUserMock, updateUserHomeCurrencyMock } = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  updateUserHomeCurrencyMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/currency/update-user-home-currency", () => ({
  updateUserHomeCurrency: updateUserHomeCurrencyMock,
  HomeCurrencyValidationError: class HomeCurrencyValidationError extends Error {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("updateUserHomeCurrencyAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({
      id: userId,
      homeCurrency: null,
    });
    updateUserHomeCurrencyMock.mockResolvedValue("USD");
  });

  it("updates only the authenticated user", async () => {
    const formData = new FormData();
    formData.set("homeCurrency", "USD");
    const result = await updateUserHomeCurrencyAction({}, formData);
    expect(result.ok).toBe(true);
    expect(updateUserHomeCurrencyMock).toHaveBeenCalledWith(userId, "USD");
  });

  it("rejects invalid currency payload", async () => {
    const formData = new FormData();
    formData.set("homeCurrency", "INVALID");
    const result = await updateUserHomeCurrencyAction({}, formData);
    expect(result.errorCode).toBe("invalid_currency");
    expect(updateUserHomeCurrencyMock).not.toHaveBeenCalled();
  });
});
