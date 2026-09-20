import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireUserMock,
  upsertMock,
  deleteMock,
} = vi.hoisted(() => ({
  requireUserMock: vi.fn(),
  upsertMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("./push-subscription-domain", () => ({
  upsertPushSubscriptionForUser: upsertMock,
  deletePushSubscriptionForUserEndpoint: deleteMock,
}));

import {
  subscribePushSubscriptionAction,
  unsubscribePushSubscriptionAction,
} from "./actions";

const validForm = () => {
  const formData = new FormData();
  formData.set("endpoint", "https://push.example.com/device-a");
  formData.set(
    "p256dh",
    "BNcRdreALRFXTkOuoPKHSEncBsp7_nISoq7v683CC654bS0lDrMZHnr7n8_1dYx8fhvYDes3U3nT3SpDIi6KI7c",
  );
  formData.set("auth", "tBHItJI5svbpez7KI4CCXg");
  return formData;
};

describe("push subscription actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-a" });
    upsertMock.mockResolvedValue(undefined);
    deleteMock.mockResolvedValue(true);
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key";
  });

  it("requires authentication and uses session userId on subscribe", async () => {
    const result = await subscribePushSubscriptionAction({}, validForm());

    expect(result.ok).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(
      "user-a",
      expect.objectContaining({
        endpoint: "https://push.example.com/device-a",
      }),
    );
  });

  it("rejects invalid subscribe payloads", async () => {
    const formData = new FormData();
    formData.set("endpoint", "not-a-url");
    formData.set("p256dh", "");
    formData.set("auth", "");

    const result = await subscribePushSubscriptionAction({}, formData);
    expect(result.errorCode).toBe("invalidInput");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("unsubscribes only the current user's endpoint", async () => {
    const formData = new FormData();
    formData.set("endpoint", "https://push.example.com/device-a");

    const result = await unsubscribePushSubscriptionAction({}, formData);

    expect(result.ok).toBe(true);
    expect(deleteMock).toHaveBeenCalledWith(
      "user-a",
      "https://push.example.com/device-a",
    );
  });

  it("returns forbidden when endpoint is not owned by the user", async () => {
    deleteMock.mockResolvedValue(false);
    const formData = new FormData();
    formData.set("endpoint", "https://push.example.com/device-a");

    const result = await unsubscribePushSubscriptionAction({}, formData);
    expect(result.errorCode).toBe("forbidden");
  });
});
