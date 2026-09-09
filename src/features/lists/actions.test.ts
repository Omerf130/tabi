import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTripListItemAction,
  deleteTripListItemAction,
  setTripListItemCompletedAction,
  updateTripListItemAction,
} from "./actions";

const tripId = "507f1f77bcf86cd799439011";
const itemId = "507f1f77bcf86cd799439012";

const {
  requireUserMock,
  requireTripMemberMock,
  createTripListItemMock,
  updateTripListItemTextMock,
  setTripListItemCompletedMock,
  deleteTripListItemMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  requireTripMemberMock: vi.fn(),
  createTripListItemMock: vi.fn(),
  updateTripListItemTextMock: vi.fn(),
  setTripListItemCompletedMock: vi.fn(),
  deleteTripListItemMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("@/features/trips/authorization", () => ({
  requireTripMember: requireTripMemberMock,
}));

vi.mock("./list-domain", () => ({
  createTripListItem: createTripListItemMock,
  updateTripListItemText: updateTripListItemTextMock,
  setTripListItemCompleted: setTripListItemCompletedMock,
  deleteTripListItem: deleteTripListItemMock,
  TripListItemValidationError: class TripListItemValidationError extends Error {},
  TripListItemNotFoundError: class TripListItemNotFoundError extends Error {
    constructor() {
      super("not found");
    }
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("trip list actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    requireTripMemberMock.mockResolvedValue({ id: tripId, role: "member" });
    createTripListItemMock.mockResolvedValue(itemId);
    updateTripListItemTextMock.mockResolvedValue(undefined);
    setTripListItemCompletedMock.mockResolvedValue(undefined);
    deleteTripListItemMock.mockResolvedValue(undefined);
  });

  it("allows members to create items", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("listType", "packing");
    formData.set("text", "מטען");

    const result = await createTripListItemAction({}, formData);

    expect(result.ok).toBe(true);
    expect(createTripListItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId,
        userId: "user-1",
      }),
    );
  });

  it("sets explicit completion state for members", async () => {
    const formData = new FormData();
    formData.set("tripId", tripId);
    formData.set("itemId", itemId);
    formData.set("isCompleted", "true");

    const result = await setTripListItemCompletedAction({}, formData);

    expect(result.ok).toBe(true);
    expect(setTripListItemCompletedMock).toHaveBeenCalledWith({
      tripId,
      itemId,
      isCompleted: true,
      userId: "user-1",
    });
  });

  it("allows owners to edit and delete items", async () => {
    requireTripMemberMock.mockResolvedValue({ id: tripId, role: "owner" });

    const updateForm = new FormData();
    updateForm.set("tripId", tripId);
    updateForm.set("itemId", itemId);
    updateForm.set("text", "מעודכן");

    const deleteForm = new FormData();
    deleteForm.set("tripId", tripId);
    deleteForm.set("itemId", itemId);

    expect((await updateTripListItemAction({}, updateForm)).ok).toBe(true);
    expect((await deleteTripListItemAction({}, deleteForm)).ok).toBe(true);
  });
});
