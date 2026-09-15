import { beforeEach, describe, expect, it, vi } from "vitest";
import { LastOwnerError, MemberNotFoundError } from "./errors";
import { leaveTrip } from "./leave-trip";

const { findOneMock, countDocumentsMock, deleteOneMock, withTransactionMock } =
  vi.hoisted(() => ({
    findOneMock: vi.fn(),
    countDocumentsMock: vi.fn(),
    deleteOneMock: vi.fn(),
    withTransactionMock: vi.fn(async (fn: (session: unknown) => Promise<unknown>) =>
      fn({}),
    ),
  }));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/lib/db/transaction", () => ({
  withTransaction: withTransactionMock,
}));

vi.mock("@/features/trips/trip-serialization", () => ({
  serializeTripMutation: vi.fn(),
}));

vi.mock("@/models/TripMember", () => ({
  TripMember: {
    findOne: findOneMock,
    countDocuments: countDocumentsMock,
    deleteOne: deleteOneMock,
  },
}));

describe("leaveTrip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes the authenticated user's membership", async () => {
    findOneMock.mockReturnValue({
      session: vi.fn().mockResolvedValue({
        _id: "mem-1",
        role: "member",
      }),
    });
    deleteOneMock.mockReturnValue({
      session: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    });

    await leaveTrip("user-1", "507f1f77bcf86cd799439011");
    expect(deleteOneMock).toHaveBeenCalled();
  });

  it("blocks sole owner from leaving", async () => {
    findOneMock.mockReturnValue({
      session: vi.fn().mockResolvedValue({
        _id: "mem-1",
        role: "owner",
      }),
    });
    countDocumentsMock.mockReturnValue({
      session: vi.fn().mockResolvedValue(1),
    });

    await expect(
      leaveTrip("user-1", "507f1f77bcf86cd799439011"),
    ).rejects.toBeInstanceOf(LastOwnerError);
  });

  it("throws when membership is missing", async () => {
    findOneMock.mockReturnValue({
      session: vi.fn().mockResolvedValue(null),
    });

    await expect(
      leaveTrip("user-1", "507f1f77bcf86cd799439011"),
    ).rejects.toBeInstanceOf(MemberNotFoundError);
  });
});
