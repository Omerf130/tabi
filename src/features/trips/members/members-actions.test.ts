import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  changeTripMemberRoleAction,
  leaveTripAction,
  removeTripMemberAction,
} from "./actions";

const tripId = "507f1f77bcf86cd799439011";
const membershipId = "507f1f77bcf86cd799439012";

const {
  requireUserMock,
  requireTripOwnerMock,
  changeTripMemberRoleMock,
  removeTripMemberMock,
  leaveTripMock,
  redirectMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  requireTripOwnerMock: vi.fn(),
  changeTripMemberRoleMock: vi.fn(),
  removeTripMemberMock: vi.fn(),
  leaveTripMock: vi.fn(),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("./change-role", () => ({
  changeTripMemberRole: changeTripMemberRoleMock,
}));

vi.mock("./remove-member", () => ({
  removeTripMember: removeTripMemberMock,
}));

vi.mock("./leave-trip", () => ({
  leaveTrip: leaveTripMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/trip-management/revalidation", () => ({
  revalidateTripManagement: vi.fn(),
}));

describe("member actions permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    requireTripOwnerMock.mockResolvedValue({});
  });

  it("requires owner for role change", async () => {
    changeTripMemberRoleMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("membershipId", membershipId);
    formData.set("role", "owner");

    const result = await changeTripMemberRoleAction({}, formData);
    expect(result.successCode).toBe("roleChanged");
    expect(requireTripOwnerMock).toHaveBeenCalledWith(tripId);
  });

  it("requires owner for removing another member", async () => {
    removeTripMemberMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("membershipId", membershipId);

    const result = await removeTripMemberAction({}, formData);
    expect(result.successCode).toBe("removed");
    expect(requireTripOwnerMock).toHaveBeenCalledWith(tripId);
  });

  it("allows self leave without requireTripOwner", async () => {
    leaveTripMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("tripId", tripId);

    await expect(leaveTripAction({}, formData)).rejects.toThrow("REDIRECT:/app");
    expect(leaveTripMock).toHaveBeenCalledWith("user-1", tripId);
    expect(requireTripOwnerMock).not.toHaveBeenCalled();
  });

  it("leave action ignores client membership id", async () => {
    leaveTripMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("membershipId", "507f1f77bcf86cd799439099");

    await expect(leaveTripAction({}, formData)).rejects.toThrow("REDIRECT:/app");
    expect(leaveTripMock).toHaveBeenCalledWith("user-1", tripId);
  });
});
