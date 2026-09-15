import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteActivityInSession } from "./delete-activity";

const {
  clearLinksMock,
  deleteLinkedExpenseMock,
  activityFindOneMock,
  activityDeleteOneMock,
} = vi.hoisted(() => ({
  clearLinksMock: vi.fn(),
  deleteLinkedExpenseMock: vi.fn(),
  activityFindOneMock: vi.fn(),
  activityDeleteOneMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/features/documents/clear-travel-document-entity-links", () => ({
  clearTravelDocumentEntityLinks: clearLinksMock,
}));

vi.mock("@/features/finance/finance-linked-expense-domain", () => ({
  deleteLinkedTripExpenseForSource: deleteLinkedExpenseMock,
}));

vi.mock("@/models/Activity", () => ({
  Activity: {
    findOne: activityFindOneMock,
    deleteOne: activityDeleteOneMock,
  },
}));

describe("deleteActivityInSession document preservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    activityFindOneMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        session: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue({ date: "2026-11-01" }),
        }),
      }),
    });
    activityDeleteOneMock.mockReturnValue({
      session: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    });
    clearLinksMock.mockResolvedValue(1);
    deleteLinkedExpenseMock.mockResolvedValue(undefined);
  });

  it("clears travel document activity links before deleting the activity", async () => {
    await deleteActivityInSession({} as never, {
      tripId: "507f1f77bcf86cd799439011",
      activityId: "507f1f77bcf86cd799439012",
    });

    expect(clearLinksMock).toHaveBeenCalledWith({
      tripId: "507f1f77bcf86cd799439011",
      activityId: "507f1f77bcf86cd799439012",
      session: {},
    });
    expect(deleteLinkedExpenseMock).toHaveBeenCalled();
  });
});
