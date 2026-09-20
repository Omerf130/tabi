import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMock } = vi.hoisted(() => ({
  findMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/TripReminder", () => ({
  TripReminder: {
    find: findMock,
  },
}));

import { listRemindersDueForNotification } from "./select-reminders-due-for-notification";

describe("listRemindersDueForNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          _id: { toString: () => "507f1f77bcf86cd799439012" },
          tripId: { toString: () => "507f1f77bcf86cd799439011" },
          userId: { toString: () => "user-1" },
          scheduledAtUtc: new Date("2026-10-23T06:00:00.000Z"),
        },
      ]),
    });
  });

  it("queries incomplete reminders with scheduledAtUtc at or before asOf", async () => {
    const asOf = new Date("2026-10-23T07:00:00.000Z");
    const due = await listRemindersDueForNotification(asOf);

    expect(findMock).toHaveBeenCalledWith({
      isCompleted: false,
      scheduledAtUtc: { $ne: null, $lte: asOf },
    });
    expect(due).toHaveLength(1);
    expect(due[0]?.scheduledAtUtc.toISOString()).toBe("2026-10-23T06:00:00.000Z");
  });
});
