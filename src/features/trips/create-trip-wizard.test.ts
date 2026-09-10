import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTripWithOwnerMembership } from "./create-trip";

const {
  connectDbMock,
  resolveDestinationSnapshotMock,
  pickVisualKeyForGroupMock,
  tripCreateMock,
  tripMemberCreateMock,
  sessionMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  resolveDestinationSnapshotMock: vi.fn(),
  pickVisualKeyForGroupMock: vi.fn(),
  tripCreateMock: vi.fn(),
  tripMemberCreateMock: vi.fn(),
  sessionMock: {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    abortTransaction: vi.fn(),
    endSession: vi.fn(),
  },
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("@/features/places/resolve-destination-snapshot", () => ({
  resolveDestinationSnapshot: resolveDestinationSnapshotMock,
}));

vi.mock("@/features/destination-visuals/pick-visual-key", () => ({
  pickVisualKeyForGroup: pickVisualKeyForGroupMock,
}));

vi.mock("mongoose", () => ({
  default: {
    startSession: vi.fn(async () => sessionMock),
  },
}));

vi.mock("@/models/Trip", () => ({
  Trip: {
    create: tripCreateMock,
  },
}));

vi.mock("@/models/TripMember", () => ({
  TripMember: {
    create: tripMemberCreateMock,
  },
}));

describe("createTripWithOwnerMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
    resolveDestinationSnapshotMock.mockResolvedValue({
      googlePlaceId: "place-jp",
      displayName: "Japan",
      countryCode: "JP",
      latitude: 36.2,
      longitude: 138.25,
    });
    pickVisualKeyForGroupMock.mockReturnValue("japan-01");
    tripCreateMock.mockResolvedValue([{ _id: { toString: () => "507f1f77bcf86cd799439011" } }]);
    tripMemberCreateMock.mockResolvedValue(undefined);
  });

  it("re-resolves googlePlaceId server-side and ignores client metadata", async () => {
    const tripId = await createTripWithOwnerMembership("user-1", {
      googlePlaceId: "place-jp",
      name: "Japan 2026",
      startDate: "2026-04-01",
      endDate: "2026-04-14",
    });

    expect(resolveDestinationSnapshotMock).toHaveBeenCalledWith("place-jp");
    expect(pickVisualKeyForGroupMock).toHaveBeenCalledWith("japan");
    expect(tripCreateMock).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          name: "Japan 2026",
          destination: expect.objectContaining({
            googlePlaceId: "place-jp",
            countryCode: "JP",
          }),
          coverVisualKey: "japan-01",
        }),
      ],
      { session: sessionMock },
    );
    expect(tripId).toBe("507f1f77bcf86cd799439011");
  });
});
