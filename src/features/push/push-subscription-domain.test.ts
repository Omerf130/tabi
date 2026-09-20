import { beforeEach, describe, expect, it, vi } from "vitest";

const { findOneAndUpdateMock, deleteOneMock } = vi.hoisted(() => ({
  findOneAndUpdateMock: vi.fn(),
  deleteOneMock: vi.fn(),
}));

vi.mock("@/lib/db/connect", () => ({
  connectDb: vi.fn(),
}));

vi.mock("@/models/PushSubscription", () => ({
  PushSubscription: {
    findOneAndUpdate: findOneAndUpdateMock,
    deleteOne: deleteOneMock,
  },
}));

import {
  deletePushSubscriptionForUserEndpoint,
  upsertPushSubscriptionForUser,
} from "./push-subscription-domain";

const subscription = {
  endpoint: "https://push.example.com/device-a",
  keys: {
    p256dh: "key-a",
    auth: "auth-a",
  },
};

describe("upsertPushSubscriptionForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findOneAndUpdateMock.mockResolvedValue({});
  });

  it("upserts by endpoint and sets userId from the authenticated user", async () => {
    await upsertPushSubscriptionForUser("user-a", subscription);

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { endpoint: subscription.endpoint },
      expect.objectContaining({
        $set: expect.objectContaining({
          userId: "user-a",
          endpoint: subscription.endpoint,
        }),
      }),
      expect.objectContaining({ upsert: true }),
    );
  });

  it("reassigns endpoint ownership when another user logs in on the same browser", async () => {
    await upsertPushSubscriptionForUser("user-a", subscription);
    await upsertPushSubscriptionForUser("user-b", subscription);

    expect(findOneAndUpdateMock).toHaveBeenLastCalledWith(
      { endpoint: subscription.endpoint },
      expect.objectContaining({
        $set: expect.objectContaining({ userId: "user-b" }),
      }),
      expect.objectContaining({ upsert: true }),
    );
  });
});

describe("deletePushSubscriptionForUserEndpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes only when userId matches", async () => {
    deleteOneMock.mockResolvedValue({ deletedCount: 1 });

    await expect(
      deletePushSubscriptionForUserEndpoint("user-a", subscription.endpoint),
    ).resolves.toBe(true);

    expect(deleteOneMock).toHaveBeenCalledWith({
      userId: "user-a",
      endpoint: subscription.endpoint,
    });
  });

  it("does not delete another user's subscription for the same endpoint lookup", async () => {
    deleteOneMock.mockResolvedValue({ deletedCount: 0 });

    await expect(
      deletePushSubscriptionForUserEndpoint("user-b", subscription.endpoint),
    ).resolves.toBe(false);
  });
});

describe("multiple device subscriptions", () => {
  it("allows distinct endpoints for the same user", async () => {
    findOneAndUpdateMock.mockResolvedValue({});
    await upsertPushSubscriptionForUser("user-a", subscription);
    await upsertPushSubscriptionForUser("user-a", {
      endpoint: "https://push.example.com/device-b",
      keys: { p256dh: "key-b", auth: "auth-b" },
    });

    expect(findOneAndUpdateMock).toHaveBeenCalledTimes(2);
    expect(findOneAndUpdateMock.mock.calls[0]?.[0]).toEqual({
      endpoint: "https://push.example.com/device-a",
    });
    expect(findOneAndUpdateMock.mock.calls[1]?.[0]).toEqual({
      endpoint: "https://push.example.com/device-b",
    });
  });
});
