import { beforeEach, describe, expect, it, vi } from "vitest";
import { REMINDER_NOTIFICATION_CLAIM_LEASE_MS } from "./constants";
import {
  buildReminderNotificationClaimFilter,
  claimReminderNotification,
} from "./reminder-notification-claim";

const { findOneAndUpdateMock } = vi.hoisted(() => ({
  findOneAndUpdateMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/TripReminder", () => ({
  TripReminder: {
    findOneAndUpdate: findOneAndUpdateMock,
  },
}));

describe("claimReminderNotification", () => {
  const now = new Date("2026-10-23T07:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("claims a due unsent reminder", async () => {
    findOneAndUpdateMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        _id: { toString: () => "507f1f77bcf86cd799439012" },
        tripId: { toString: () => "507f1f77bcf86cd799439011" },
        userId: { toString: () => "user-1" },
        scheduledAtUtc: new Date("2026-10-23T06:00:00.000Z"),
      }),
    });

    const claimed = await claimReminderNotification(
      "507f1f77bcf86cd799439012",
      now,
    );

    expect(claimed?.scheduledAtUtc.toISOString()).toBe("2026-10-23T06:00:00.000Z");
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      buildReminderNotificationClaimFilter("507f1f77bcf86cd799439012", now),
      { $set: { notificationClaimedAt: now } },
      { new: true },
    );
  });

  it("returns null when reminder is not claimable", async () => {
    findOneAndUpdateMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(null),
    });

    await expect(
      claimReminderNotification("507f1f77bcf86cd799439012", now),
    ).resolves.toBeNull();
  });

  it("includes stale claim threshold in filter", () => {
    const filter = buildReminderNotificationClaimFilter(
      "507f1f77bcf86cd799439012",
      now,
    ) as {
      $and: Array<{ $or: Array<Record<string, unknown>> }>;
    };

    const claimBranch = filter.$and[1]?.$or;
    const staleBefore = new Date(now.getTime() - REMINDER_NOTIFICATION_CLAIM_LEASE_MS);
    expect(claimBranch).toContainEqual({
      notificationClaimedAt: { $lte: staleBefore },
    });
  });

  it("allows only one concurrent claim winner for the same reminder", async () => {
    let claimCount = 0;
    findOneAndUpdateMock.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockImplementation(async () => {
        claimCount += 1;
        if (claimCount === 1) {
          return {
            _id: { toString: () => "507f1f77bcf86cd799439012" },
            tripId: { toString: () => "507f1f77bcf86cd799439011" },
            userId: { toString: () => "user-1" },
            scheduledAtUtc: new Date("2026-10-23T06:00:00.000Z"),
          };
        }
        return null;
      }),
    }));

    const [first, second] = await Promise.all([
      claimReminderNotification("507f1f77bcf86cd799439012", now),
      claimReminderNotification("507f1f77bcf86cd799439012", now),
    ]);

    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });
});
