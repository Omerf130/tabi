import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClaimedReminderNotification } from "./reminder-notification-claim";

const {
  validateMock,
  listSubsMock,
  sendMock,
  markSentMock,
  releaseClaimMock,
  deleteEndpointMock,
  userFindMock,
} = vi.hoisted(() => ({
  validateMock: vi.fn(),
  listSubsMock: vi.fn(),
  sendMock: vi.fn(),
  markSentMock: vi.fn(),
  releaseClaimMock: vi.fn(),
  deleteEndpointMock: vi.fn(),
  userFindMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("./validate-reminder-before-send", () => ({
  validateClaimedReminderBeforeSend: validateMock,
}));

vi.mock("../push-subscription-domain", () => ({
  listPushSubscriptionsForUser: listSubsMock,
  deletePushSubscriptionByEndpoint: deleteEndpointMock,
}));

vi.mock("./web-push-sender", () => ({
  sendWebPushNotification: sendMock,
}));

vi.mock("./reminder-notification-claim", async () => {
  const actual = await vi.importActual<typeof import("./reminder-notification-claim")>(
    "./reminder-notification-claim",
  );
  return {
    ...actual,
    markReminderNotificationSent: markSentMock,
    releaseReminderNotificationClaim: releaseClaimMock,
  };
});

vi.mock("@/models/User", () => ({
  User: {
    findById: userFindMock,
  },
}));

import { processClaimedReminderNotification } from "./deliver-due-reminder-notifications";

const claimed: ClaimedReminderNotification = {
  id: "507f1f77bcf86cd799439012",
  tripId: "507f1f77bcf86cd799439011",
  userId: "user-1",
  scheduledAtUtc: new Date("2026-10-23T06:00:00.000Z"),
};

const now = new Date("2026-10-23T07:00:00.000Z");

describe("processClaimedReminderNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateMock.mockResolvedValue({ ok: true, reminder: claimed });
    userFindMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({ locale: "en" }),
    });
    markSentMock.mockResolvedValue(true);
    releaseClaimMock.mockResolvedValue(undefined);
    deleteEndpointMock.mockResolvedValue(true);
  });

  it("does not include reminder text in push payload", async () => {
    listSubsMock.mockResolvedValue([
      {
        endpoint: "https://push/a",
        keys: { p256dh: "p", auth: "a" },
      },
    ]);
    sendMock.mockResolvedValue({ status: "success" });

    await processClaimedReminderNotification(claimed, now);

    const payload = JSON.parse(
      JSON.stringify(sendMock.mock.calls[0]?.[1] ?? {}),
    ) as Record<string, string>;
    expect(payload.body).toBe("You have a trip reminder");
    expect(payload.url).toBe(`/app/trips/${claimed.tripId}`);
    expect(payload.tag).toBe(`reminder-${claimed.id}`);
    expect(JSON.stringify(payload)).not.toContain("secret reminder text");
  });

  it("marks sent when one device succeeds and another fails temporarily", async () => {
    listSubsMock.mockResolvedValue([
      {
        endpoint: "https://push/a",
        keys: { p256dh: "p1", auth: "a1" },
      },
      {
        endpoint: "https://push/b",
        keys: { p256dh: "p2", auth: "a2" },
      },
    ]);
    sendMock
      .mockResolvedValueOnce({ status: "success" })
      .mockResolvedValueOnce({ status: "temporary_failure", statusCode: 503 });

    const result = await processClaimedReminderNotification(claimed, now);

    expect(result.outcome).toBe("sent");
    expect(markSentMock).toHaveBeenCalled();
  });

  it("removes expired subscription and still marks sent when another device succeeds", async () => {
    listSubsMock.mockResolvedValue([
      {
        endpoint: "https://push/a",
        keys: { p256dh: "p1", auth: "a1" },
      },
      {
        endpoint: "https://push/b",
        keys: { p256dh: "p2", auth: "a2" },
      },
    ]);
    sendMock
      .mockResolvedValueOnce({ status: "expired_subscription", statusCode: 410 })
      .mockResolvedValueOnce({ status: "success" });

    const result = await processClaimedReminderNotification(claimed, now);

    expect(deleteEndpointMock).toHaveBeenCalledWith("https://push/a");
    expect(result.outcome).toBe("sent");
    expect(markSentMock).toHaveBeenCalled();
  });

  it("releases claim when all device sends fail", async () => {
    listSubsMock.mockResolvedValue([
      {
        endpoint: "https://push/a",
        keys: { p256dh: "p1", auth: "a1" },
      },
      {
        endpoint: "https://push/b",
        keys: { p256dh: "p2", auth: "a2" },
      },
    ]);
    sendMock.mockResolvedValue({ status: "temporary_failure", statusCode: 503 });

    const result = await processClaimedReminderNotification(claimed, now);

    expect(result.outcome).toBe("failed");
    expect(markSentMock).not.toHaveBeenCalled();
    expect(releaseClaimMock).toHaveBeenCalledWith(claimed.id);
  });

  it("defers without marking sent when user has zero subscriptions", async () => {
    listSubsMock.mockResolvedValue([]);

    const result = await processClaimedReminderNotification(claimed, now);

    expect(result.outcome).toBe("deferred");
    expect(markSentMock).not.toHaveBeenCalled();
    expect(releaseClaimMock).not.toHaveBeenCalled();
  });

  it("skips and releases claim when schedule changed after claim", async () => {
    validateMock.mockResolvedValue({ ok: false, reason: "schedule_changed" });

    const result = await processClaimedReminderNotification(claimed, now);

    expect(result.outcome).toBe("skipped");
    expect(releaseClaimMock).toHaveBeenCalledWith(claimed.id);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("skips completed-after-claim without sending", async () => {
    validateMock.mockResolvedValue({ ok: false, reason: "completed" });

    const result = await processClaimedReminderNotification(claimed, now);

    expect(result.outcome).toBe("skipped");
    expect(sendMock).not.toHaveBeenCalled();
  });
});
