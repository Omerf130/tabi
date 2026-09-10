import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateTripFinanceSettingsAction } from "./actions";

const tripId = "507f1f77bcf86cd799439011";

const {
  requireTripOwnerMock,
  getOrCreateTripFinanceSettingsMock,
  updateTripFinanceSettingsMock,
} = vi.hoisted(() => ({
  requireTripOwnerMock: vi.fn(),
  getOrCreateTripFinanceSettingsMock: vi.fn(),
  updateTripFinanceSettingsMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("./finance-settings-domain", () => ({
  getOrCreateTripFinanceSettings: getOrCreateTripFinanceSettingsMock,
  updateTripFinanceSettings: updateTripFinanceSettingsMock,
  FinanceSettingsValidationError: class FinanceSettingsValidationError extends Error {},
  FinanceSettingsNotFoundError: class FinanceSettingsNotFoundError extends Error {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("finance settings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({ id: tripId, role: "owner" });
    getOrCreateTripFinanceSettingsMock.mockResolvedValue({
      id: "settings-1",
      tripId,
      baseCurrency: "ILS",
      budgetAmount: null,
    });
    updateTripFinanceSettingsMock.mockResolvedValue({
      id: "settings-1",
      tripId,
      baseCurrency: "ILS",
      budgetAmount: 30000,
    });
  });

  it("allows owners to update finance settings", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("budgetAmount", "30000");

    const result = await updateTripFinanceSettingsAction({}, formData);

    expect(result.ok).toBe(true);
    expect(requireTripOwnerMock).toHaveBeenCalledWith(tripId);
    expect(updateTripFinanceSettingsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId,
        budgetAmount: 30000,
      }),
    );
  });

  it("rejects member mutations through owner authorization", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("not found"));

    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("budgetAmount", "30000");

    const result = await updateTripFinanceSettingsAction({}, formData);

    expect(result.ok).toBeUndefined();
    expect(result.error).toBeTruthy();
    expect(updateTripFinanceSettingsMock).not.toHaveBeenCalled();
  });
});
