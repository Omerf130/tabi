import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TripListItemNotFoundError,
  createTripListItem,
  deleteTripListItem,
  ensureTripListsSeeded,
  setTripListItemCompleted,
  updateTripListItemText,
} from "./list-domain";
import { DEFAULT_TRIP_LIST_ITEMS } from "./default-items";

const tripId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";

const {
  connectDbMock,
  withTransactionMock,
  tripFindByIdMock,
  tripFindOneAndUpdateMock,
  tripListItemInsertManyMock,
  tripListItemFindMock,
  tripListItemFindOneMock,
  tripListItemCreateMock,
  tripListItemFindOneAndUpdateMock,
  tripListItemFindOneAndDeleteMock,
} = vi.hoisted(() => ({
  connectDbMock: vi.fn(),
  withTransactionMock: vi.fn(),
  tripFindByIdMock: vi.fn(),
  tripFindOneAndUpdateMock: vi.fn(),
  tripListItemInsertManyMock: vi.fn(),
  tripListItemFindMock: vi.fn(),
  tripListItemFindOneMock: vi.fn(),
  tripListItemCreateMock: vi.fn(),
  tripListItemFindOneAndUpdateMock: vi.fn(),
  tripListItemFindOneAndDeleteMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: connectDbMock,
}));

vi.mock("@/lib/db/transaction", () => ({
  withTransaction: withTransactionMock,
}));

vi.mock("@/models/Trip", () => ({
  Trip: {
    findById: tripFindByIdMock,
    findOneAndUpdate: tripFindOneAndUpdateMock,
  },
}));

vi.mock("@/models/TripListItem", () => ({
  TripListItem: {
    insertMany: tripListItemInsertManyMock,
    find: tripListItemFindMock,
    findOne: tripListItemFindOneMock,
    create: tripListItemCreateMock,
    findOneAndUpdate: tripListItemFindOneAndUpdateMock,
    findOneAndDelete: tripListItemFindOneAndDeleteMock,
  },
}));

describe("trip list domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectDbMock.mockResolvedValue(undefined);
    withTransactionMock.mockImplementation(async (fn) => fn({}));
    tripFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ initializations: { listsV1: false } }),
      }),
    });
    tripFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: tripId }),
    });
    tripListItemInsertManyMock.mockResolvedValue(undefined);
    tripListItemFindMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ order: 2 }]),
      }),
    });
    tripListItemCreateMock.mockResolvedValue({
      _id: { toString: () => itemId },
    });
    tripListItemFindOneMock.mockReturnValue({
      lean: vi.fn(),
    });
    tripListItemFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: itemId }),
    });
    tripListItemFindOneAndDeleteMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: itemId }),
    });
  });

  it("skips seeding when listsV1 is already true", async () => {
    tripFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ initializations: { listsV1: true } }),
      }),
    });

    await ensureTripListsSeeded(tripId);

    expect(withTransactionMock).not.toHaveBeenCalled();
  });

  it("seeds defaults inside a transaction when claim succeeds", async () => {
    await ensureTripListsSeeded(tripId);

    expect(withTransactionMock).toHaveBeenCalledTimes(1);
    expect(tripFindOneAndUpdateMock).toHaveBeenCalled();
    expect(tripListItemInsertManyMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ tripId, listType: "packing", text: "דרכון" }),
      ]),
      expect.objectContaining({ session: {} }),
    );
    expect(tripListItemInsertManyMock.mock.calls[0][0]).toHaveLength(
      DEFAULT_TRIP_LIST_ITEMS.length,
    );
  });

  it("does not insert defaults when another request already claimed initialization", async () => {
    tripFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await ensureTripListsSeeded(tripId);

    expect(tripListItemInsertManyMock).not.toHaveBeenCalled();
  });

  it("creates a new item appended after existing max order", async () => {
    tripFindByIdMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ initializations: { listsV1: true } }),
      }),
    });

    const createdId = await createTripListItem({
      tripId,
      listType: "packing",
      text: "מטען נייד",
      userId,
    });

    expect(createdId).toBe(itemId);
    expect(tripListItemCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId,
        listType: "packing",
        text: "מטען נייד",
        order: 3,
        createdByUserId: userId,
      }),
    );
  });

  it("sets completion to true with audit fields", async () => {
    tripListItemFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: itemId, isCompleted: false }),
    });

    await setTripListItemCompleted({
      tripId,
      itemId,
      isCompleted: true,
      userId,
    });

    expect(tripListItemFindOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: itemId, tripId },
      expect.objectContaining({ isCompleted: true }),
    );
  });

  it("is idempotent when setting true on an already completed item", async () => {
    tripListItemFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: itemId, isCompleted: true }),
    });

    await setTripListItemCompleted({
      tripId,
      itemId,
      isCompleted: true,
      userId,
    });

    expect(tripListItemFindOneAndUpdateMock).not.toHaveBeenCalled();
  });

  it("clears completion audit fields when setting false", async () => {
    tripListItemFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: itemId, isCompleted: true }),
    });

    await setTripListItemCompleted({
      tripId,
      itemId,
      isCompleted: false,
      userId,
    });

    expect(tripListItemFindOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: itemId, tripId },
      expect.objectContaining({
        isCompleted: false,
        completedByUserId: null,
        completedAt: null,
      }),
    );
  });

  it("is idempotent when setting false on an already incomplete item", async () => {
    tripListItemFindOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: itemId, isCompleted: false }),
    });

    await setTripListItemCompleted({
      tripId,
      itemId,
      isCompleted: false,
      userId,
    });

    expect(tripListItemFindOneAndUpdateMock).not.toHaveBeenCalled();
  });

  it("throws when updating a missing item", async () => {
    tripListItemFindOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(
      updateTripListItemText({ tripId, itemId, text: "חדש" }),
    ).rejects.toBeInstanceOf(TripListItemNotFoundError);
  });

  it("deletes an item scoped by tripId", async () => {
    await deleteTripListItem({ tripId, itemId });

    expect(tripListItemFindOneAndDeleteMock).toHaveBeenCalledWith({
      _id: itemId,
      tripId,
    });
  });
});
