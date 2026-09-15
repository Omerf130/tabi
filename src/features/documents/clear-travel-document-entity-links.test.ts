import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearTravelDocumentEntityLinks } from "./clear-travel-document-entity-links";

const { updateManyMock } = vi.hoisted(() => ({
  updateManyMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/TravelDocument", () => ({
  TravelDocument: {
    updateMany: updateManyMock,
  },
}));

describe("clearTravelDocumentEntityLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateManyMock.mockImplementation(() => {
      const promise = Promise.resolve({ modifiedCount: 1 });
      return Object.assign(promise, {
        session: vi.fn().mockReturnValue(promise),
      });
    });
  });

  it("clears activity links without deleting documents", async () => {
    const modified = await clearTravelDocumentEntityLinks({
      tripId: "507f1f77bcf86cd799439011",
      activityId: "507f1f77bcf86cd799439012",
    });

    expect(modified).toBe(1);
    expect(updateManyMock).toHaveBeenCalledWith(
      {
        tripId: "507f1f77bcf86cd799439011",
        activityId: "507f1f77bcf86cd799439012",
      },
      { $set: { activityId: null } },
    );
  });
});
