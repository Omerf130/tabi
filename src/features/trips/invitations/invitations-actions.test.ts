import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTripInviteAction,
  revokeTripInvitationAction,
} from "./actions";

const tripId = "507f1f77bcf86cd799439011";

const {
  requireUserMock,
  requireTripOwnerMock,
  createTripInvitationMock,
  revokeTripInvitationMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  requireTripOwnerMock: vi.fn(),
  createTripInvitationMock: vi.fn(),
  revokeTripInvitationMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("./create-invitation", () => ({
  createTripInvitation: createTripInvitationMock,
}));

vi.mock("./revoke-invitation", () => ({
  revokeTripInvitation: revokeTripInvitationMock,
}));

vi.mock("@/lib/http/get-request-origin", () => ({
  getRequestOrigin: vi.fn().mockResolvedValue("https://tabi.test"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/trip-management/revalidation", () => ({
  revalidateTripManagement: vi.fn(),
}));

describe("invitation actions permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "owner-1" });
    requireTripOwnerMock.mockResolvedValue({});
    createTripInvitationMock.mockResolvedValue({
      inviteUrl: "https://tabi.test/invite/token",
      rawToken: "token",
    });
    revokeTripInvitationMock.mockResolvedValue(undefined);
  });

  it("allows owners to create invites", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("role", "member");

    const result = await createTripInviteAction({}, formData);
    expect(result.inviteUrl).toContain("/invite/");
    expect(requireTripOwnerMock).toHaveBeenCalledWith(tripId);
  });

  it("blocks non-owners from creating invites", async () => {
    requireTripOwnerMock.mockRejectedValue(new Error("not found"));
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("role", "member");

    const result = await createTripInviteAction({}, formData);
    expect(result.errorCode).toBe("generic");
    expect(createTripInvitationMock).not.toHaveBeenCalled();
  });

  it("allows owners to revoke invites", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("invitationId", "507f1f77bcf86cd799439012");

    const result = await revokeTripInvitationAction({}, formData);
    expect(result.errorCode).toBeUndefined();
    expect(revokeTripInvitationMock).toHaveBeenCalled();
  });
});
