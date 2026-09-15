import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateTripDestination, updateTripIdentity } from "./update-trip-details";

const {
  requireTripOwnerMock,
  connectDbMock,
  tripFindByIdMock,
  tripFindByIdAndUpdateMock,
  resolveDestinationSnapshotMock,
  pickVisualKeyForGroupMock,
  revalidateTripManagementMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  requireTripOwnerMock: vi.fn(),
  connectDbMock: vi.fn(),
  tripFindByIdMock: vi.fn(),
  tripFindByIdAndUpdateMock: vi.fn(),
  resolveDestinationSnapshotMock: vi.fn(),
  pickVisualKeyForGroupMock: vi.fn(),
  revalidateTripManagementMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripOwner: requireTripOwnerMock,
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("@/models/Trip", () => ({
  Trip: {
    findById: tripFindByIdMock,
    findByIdAndUpdate: tripFindByIdAndUpdateMock,
  },
}));

vi.mock("@/features/places/resolve-destination-snapshot", () => ({
  resolveDestinationSnapshot: resolveDestinationSnapshotMock,
}));

vi.mock("@/features/destination-visuals/pick-visual-key", () => ({
  pickVisualKeyForGroup: pickVisualKeyForGroupMock,
}));

vi.mock("@/features/trip-management/revalidation", () => ({
  revalidateTripManagement: revalidateTripManagementMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

const tripId = "507f1f77bcf86cd799439011";

describe("updateTripIdentity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({ id: tripId, role: "owner" });
    connectDbMock.mockResolvedValue(undefined);
    tripFindByIdAndUpdateMock.mockResolvedValue({ _id: tripId });
  });

  it("updates name and description for owner", async () => {
    await updateTripIdentity({
      tripId,
      name: "Updated trip",
      description: "Notes",
    });

    expect(requireTripOwnerMock).toHaveBeenCalledWith(tripId);
    expect(tripFindByIdAndUpdateMock).toHaveBeenCalledWith(
      tripId,
      { $set: { name: "Updated trip", description: "Notes" } },
      { runValidators: true },
    );
    expect(revalidateTripManagementMock).toHaveBeenCalledWith(tripId, "details");
    expect(revalidatePathMock).toHaveBeenCalledWith(`/app/trips/${tripId}`);
  });
});

describe("updateTripDestination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTripOwnerMock.mockResolvedValue({ id: tripId, role: "owner" });
    connectDbMock.mockResolvedValue(undefined);
    resolveDestinationSnapshotMock.mockResolvedValue({
      googlePlaceId: "place-fr",
      displayName: "Paris",
      countryCode: "FR",
      latitude: 48.8,
      longitude: 2.3,
    });
    pickVisualKeyForGroupMock.mockReturnValue("europe-01");
    tripFindByIdAndUpdateMock.mockResolvedValue({ _id: tripId });
  });

  it("updates destination snapshot and refreshes coverVisualKey without custom cover", async () => {
    tripFindByIdMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: tripId, coverImage: null }),
    });

    await updateTripDestination({
      tripId,
      googlePlaceId: "place-fr",
    });

    expect(resolveDestinationSnapshotMock).toHaveBeenCalledWith("place-fr");
    expect(tripFindByIdAndUpdateMock).toHaveBeenCalledWith(
      tripId,
      {
        $set: {
          destination: expect.objectContaining({ googlePlaceId: "place-fr" }),
          coverVisualKey: "europe-01",
        },
      },
      { runValidators: true },
    );
  });

  it("preserves custom cover when destination changes", async () => {
    tripFindByIdMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: tripId,
        coverImage: { pathname: "covers/x.jpg", url: "https://x", contentType: "image/jpeg" },
      }),
    });

    await updateTripDestination({
      tripId,
      googlePlaceId: "place-fr",
    });

    expect(pickVisualKeyForGroupMock).not.toHaveBeenCalled();
    expect(tripFindByIdAndUpdateMock).toHaveBeenCalledWith(
      tripId,
      {
        $set: {
          destination: expect.objectContaining({ googlePlaceId: "place-fr" }),
        },
      },
      { runValidators: true },
    );
  });
});
