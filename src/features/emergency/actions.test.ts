import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTripEmergencyResourceAction,
  deleteTripEmergencyResourceAction,
} from "./actions";

const tripId = "507f1f77bcf86cd799439011";
const resourceId = "507f1f77bcf86cd799439012";

const {
  requireUserMock,
  requireTripMemberMock,
  createTripEmergencyResourceMock,
  deleteTripEmergencyResourceMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  requireTripMemberMock: vi.fn(),
  createTripEmergencyResourceMock: vi.fn(),
  deleteTripEmergencyResourceMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("./trip-emergency-resource-domain", () => ({
  createTripEmergencyResource: createTripEmergencyResourceMock,
  updateTripEmergencyResource: vi.fn(),
  deleteTripEmergencyResource: deleteTripEmergencyResourceMock,
  TripEmergencyResourceNotFoundError: class TripEmergencyResourceNotFoundError extends Error {},
  TripEmergencyResourceValidationError: class TripEmergencyResourceValidationError extends Error {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("trip emergency resource actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    requireTripMemberMock.mockResolvedValue({ id: tripId });
    createTripEmergencyResourceMock.mockResolvedValue(resourceId);
    deleteTripEmergencyResourceMock.mockResolvedValue(undefined);
  });

  it("creates a resource for a trip member", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("category", "insurance");
    formData.set("title", "ביטוח");
    formData.set("phone", "03-1234567");

    const result = await createTripEmergencyResourceAction({}, formData);

    expect(result.ok).toBe(true);
    expect(createTripEmergencyResourceMock).toHaveBeenCalledWith({
      tripId,
      userId: "user-1",
      data: expect.objectContaining({ title: "ביטוח" }),
    });
  });

  it("deletes a resource for a trip member", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("resourceId", resourceId);

    const result = await deleteTripEmergencyResourceAction({}, formData);

    expect(result.ok).toBe(true);
    expect(deleteTripEmergencyResourceMock).toHaveBeenCalledWith({
      tripId,
      resourceId,
    });
  });
});
