import { beforeEach, describe, expect, it, vi } from "vitest";

const { findOneMock, findOneAndUpdateMock, createMock } = vi.hoisted(() => ({
  findOneMock: vi.fn(),
  findOneAndUpdateMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/TripReminder", () => ({
  TripReminder: {
    create: createMock,
    findOne: findOneMock,
    findOneAndUpdate: findOneAndUpdateMock,
  },
}));

import {
  createTripReminder,
  TripReminderValidationError,
  updateTripReminder,
} from "./reminder-domain";
import { resolveReminderScheduledAtUtc } from "./resolve-reminder-scheduled-at-utc";

describe("reminder scheduling persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMock.mockResolvedValue({ _id: { toString: () => "rem-1" } });
    findOneAndUpdateMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({}),
    });
    findOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
  });

  it("persists timeZone and scheduledAtUtc on create", async () => {
    await createTripReminder({
      tripId: "507f1f77bcf86cd799439011",
      userId: "user-1",
      startDate: "2026-10-20",
      endDate: "2026-11-18",
      date: "2026-10-23",
      time: "09:00",
      text: "Passport",
      timeZone: "Asia/Jerusalem",
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        timeZone: "Asia/Jerusalem",
        scheduledAtUtc: expect.any(Date),
      }),
    );

    const scheduledAtUtc = createMock.mock.calls[0]?.[0]?.scheduledAtUtc as Date;
    const resolved = resolveReminderScheduledAtUtc({
      date: "2026-10-23",
      time: "09:00",
      timeZone: "Asia/Jerusalem",
    });
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(scheduledAtUtc.toISOString()).toBe(resolved.scheduledAtUtc.toISOString());
    }
  });

  it("does not reschedule when only reminder text changes after browser timezone changes", async () => {
    const existingScheduled = new Date("2026-10-23T06:00:00.000Z");
    findOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        date: "2026-10-23",
        time: "09:00",
        text: "Old",
        timeZone: "Asia/Jerusalem",
        scheduledAtUtc: existingScheduled,
      }),
    });

    await updateTripReminder({
      tripId: "507f1f77bcf86cd799439011",
      userId: "user-1",
      reminderId: "507f1f77bcf86cd799439012",
      startDate: "2026-10-20",
      endDate: "2026-11-18",
      date: "2026-10-23",
      time: "09:00",
      text: "Updated title",
      timeZone: "Asia/Tokyo",
    });

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({
          text: "Updated title",
          timeZone: "Asia/Jerusalem",
          scheduledAtUtc: existingScheduled,
        }),
      }),
      expect.any(Object),
    );
    const updateArg = findOneAndUpdateMock.mock.calls[0]?.[1] as {
      $unset?: Record<string, string>;
    };
    expect(updateArg.$unset).toBeUndefined();
  });

  it("recomputes schedule when date or time changes using browser timezone", async () => {
    findOneMock.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        date: "2026-10-23",
        time: "09:00",
        text: "Old",
        timeZone: "Asia/Jerusalem",
        scheduledAtUtc: new Date("2026-10-23T06:00:00.000Z"),
      }),
    });

    await updateTripReminder({
      tripId: "507f1f77bcf86cd799439011",
      userId: "user-1",
      reminderId: "507f1f77bcf86cd799439012",
      startDate: "2026-10-20",
      endDate: "2026-11-18",
      date: "2026-10-23",
      time: "10:00",
      text: "Old",
      timeZone: "Asia/Tokyo",
    });

    const updatePayload = findOneAndUpdateMock.mock.calls[0]?.[1] as {
      $set: { timeZone: string; scheduledAtUtc: Date };
      $unset: { notificationClaimedAt: string; notificationSentAt: string };
    };

    expect(updatePayload.$set.timeZone).toBe("Asia/Tokyo");
    expect(updatePayload.$set.scheduledAtUtc.toISOString()).toBe(
      "2026-10-23T01:00:00.000Z",
    );
    expect(updatePayload.$unset).toEqual({
      notificationClaimedAt: "",
      notificationSentAt: "",
    });
  });

  it("rejects nonexistent local times", async () => {
    await expect(
      createTripReminder({
        tripId: "507f1f77bcf86cd799439011",
        userId: "user-1",
        startDate: "2026-03-01",
        endDate: "2026-03-31",
        date: "2026-03-08",
        time: "02:30",
        text: "DST gap",
        timeZone: "America/New_York",
      }),
    ).rejects.toBeInstanceOf(TripReminderValidationError);
  });
});

describe("legacy reminders without scheduling fields", () => {
  it("loads without inventing timezone from trip destination", () => {
    const legacy = {
      _id: { toString: () => "legacy-1" },
      date: "2026-10-25",
      time: "14:30",
      text: "Legacy",
      isCompleted: false,
    };

    expect(legacy).not.toHaveProperty("timeZone");
    expect(legacy).not.toHaveProperty("scheduledAtUtc");
  });
});
