import { beforeEach, describe, expect, it, vi } from "vitest";
import { isCreateTripWizardFailure } from "@/features/create-trip/create-trip-wizard-result";
import { createTripWizardAction } from "./actions";

const { requireUserMock, createTripWithOwnerMembershipMock } = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  createTripWithOwnerMembershipMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("./create-trip", () => ({
  createTripWithOwnerMembership: createTripWithOwnerMembershipMock,
}));

describe("createTripWizardAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    createTripWithOwnerMembershipMock.mockResolvedValue(
      "507f1f77bcf86cd799439011",
    );
  });

  it("accepts only identity fields and returns tripId after server-side create", async () => {
    const result = await createTripWizardAction({
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
    });

    expect(result).toEqual({ tripId: "507f1f77bcf86cd799439011" });

    expect(createTripWithOwnerMembershipMock).toHaveBeenCalledWith("user-1", {
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      description: "",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
    });
  });

  it("rejects client attempts to submit themeKey via strict schema", async () => {
    const result = await createTripWizardAction({
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
      themeKey: "ocean",
    } as never);

    expect(isCreateTripWizardFailure(result)).toBe(true);
    if (isCreateTripWizardFailure(result)) {
      expect(result.fieldErrors ?? result.error).toBeTruthy();
    }
    expect(createTripWithOwnerMembershipMock).not.toHaveBeenCalled();
  });

  it("rejects client attempts to submit coverVisualKey via strict schema", async () => {
    const result = await createTripWizardAction({
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
      coverVisualKey: "europe-01",
    } as never);

    expect(isCreateTripWizardFailure(result)).toBe(true);
    if (isCreateTripWizardFailure(result)) {
      expect(result.fieldErrors ?? result.error).toBeTruthy();
    }
    expect(createTripWithOwnerMembershipMock).not.toHaveBeenCalled();
  });

  it("accepts an optional trip description", async () => {
    const result = await createTripWizardAction({
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      description: "Our honeymoon in Japan",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
    });

    expect(result).toEqual({ tripId: "507f1f77bcf86cd799439011" });

    expect(createTripWithOwnerMembershipMock).toHaveBeenCalledWith("user-1", {
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      description: "Our honeymoon in Japan",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
    });
  });

  it("rejects descriptions longer than 300 characters", async () => {
    const result = await createTripWizardAction({
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      description: "x".repeat(301),
      startDate: "2026-04-01",
      endDate: "2026-04-14",
    });

    expect(isCreateTripWizardFailure(result)).toBe(true);
    if (isCreateTripWizardFailure(result)) {
      expect(result.fieldErrors ?? result.error).toBeTruthy();
    }
    expect(createTripWithOwnerMembershipMock).not.toHaveBeenCalled();
  });

  it("rejects client attempts to submit countryCode", async () => {
    const result = await createTripWizardAction({
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
      countryCode: "FR",
    } as never);

    expect(isCreateTripWizardFailure(result)).toBe(true);
    if (isCreateTripWizardFailure(result)) {
      expect(result.fieldErrors ?? result.error).toBeTruthy();
    }
    expect(createTripWithOwnerMembershipMock).not.toHaveBeenCalled();
  });
});
