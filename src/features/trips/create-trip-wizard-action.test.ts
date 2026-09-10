import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTripWizardAction } from "./actions";

const {
  requireUserMock,
  createTripWithOwnerMembershipMock,
  redirectMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  createTripWithOwnerMembershipMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("./create-trip", () => ({
  createTripWithOwnerMembership: createTripWithOwnerMembershipMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("createTripWizardAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    createTripWithOwnerMembershipMock.mockResolvedValue(
      "507f1f77bcf86cd799439011",
    );
  });

  it("accepts only identity fields and redirects after server-side create", async () => {
    await expect(
      createTripWizardAction({
        googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
        name: "Japan 2026",
        startDate: "2026-04-01",
        endDate: "2026-04-14",
      }),
    ).rejects.toThrow("REDIRECT:/app/trips/507f1f77bcf86cd799439011");

    expect(createTripWithOwnerMembershipMock).toHaveBeenCalledWith("user-1", {
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
    });
  });

  it("rejects client attempts to submit coverVisualKey via strict schema", async () => {
    const result = await createTripWizardAction({
      googlePlaceId: "ChIJ1worBWrCCDARq60jfE0JAJ8",
      name: "Japan 2026",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
      coverVisualKey: "europe-01",
    } as never);

    expect(result.fieldErrors ?? result.error).toBeTruthy();
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

    expect(result.fieldErrors ?? result.error).toBeTruthy();
    expect(createTripWithOwnerMembershipMock).not.toHaveBeenCalled();
  });
});
