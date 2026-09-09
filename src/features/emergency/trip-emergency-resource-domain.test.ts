import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TripEmergencyResourceNotFoundError,
  createTripEmergencyResource,
  deleteTripEmergencyResource,
  listTripEmergencyResources,
  updateTripEmergencyResource,
} from "./trip-emergency-resource-domain";

const tripId = "507f1f77bcf86cd799439011";
const resourceId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";

const {
  connectDbMock,
  findMock,
  createMock,
  findOneAndUpdateMock,
  findOneAndDeleteMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  findMock: vi.fn(),
  createMock: vi.fn(),
  findOneAndUpdateMock: vi.fn(),
  findOneAndDeleteMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("@/models/TripEmergencyResource", () => ({
  TripEmergencyResource: {
    find: findMock,
    create: createMock,
    findOneAndUpdate: findOneAndUpdateMock,
    findOneAndDelete: findOneAndDeleteMock,
  },
}));

describe("trip emergency resource domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
    findMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: resourceId, tripId, title: "A" }]),
      }),
    });
    createMock.mockResolvedValue({ _id: resourceId });
    findOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: resourceId }),
    });
    findOneAndDeleteMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: resourceId }),
    });
  });

  it("lists resources for a trip", async () => {
    const resources = await listTripEmergencyResources(tripId);
    expect(resources).toHaveLength(1);
    expect(findMock).toHaveBeenCalledWith({ tripId });
  });

  it("creates a resource", async () => {
    const id = await createTripEmergencyResource({
      tripId,
      userId,
      data: {
        tripId,
        category: "insurance",
        title: "ביטוח",
        phone: "03-1111111",
        secondaryPhone: undefined,
        email: undefined,
        address: undefined,
        url: undefined,
        reference: undefined,
        notes: undefined,
      },
    });

    expect(id).toBe(resourceId);
    expect(createMock).toHaveBeenCalled();
  });

  it("updates and deletes scoped by trip", async () => {
    await updateTripEmergencyResource({
      tripId,
      resourceId,
      data: {
        tripId,
        resourceId,
        category: "medical",
        title: "מרפאה",
        phone: undefined,
        secondaryPhone: undefined,
        email: undefined,
        address: undefined,
        url: undefined,
        reference: undefined,
        notes: "פתוח",
      },
    });

    await deleteTripEmergencyResource({ tripId, resourceId });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: resourceId, tripId },
      expect.any(Object),
      expect.any(Object),
    );
    expect(findOneAndDeleteMock).toHaveBeenCalledWith({ _id: resourceId, tripId });
  });

  it("throws when resource is missing", async () => {
    findOneAndDeleteMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(deleteTripEmergencyResource({ tripId, resourceId })).rejects.toBeInstanceOf(
      TripEmergencyResourceNotFoundError,
    );
  });
});
