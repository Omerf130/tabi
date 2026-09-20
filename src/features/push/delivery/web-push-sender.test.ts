import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendNotificationMock, setVapidDetailsMock } = vi.hoisted(() => ({
  sendNotificationMock: vi.fn(),
  setVapidDetailsMock: vi.fn(),
}));

vi.mock("web-push", () => ({
  default: {
    sendNotification: sendNotificationMock,
    setVapidDetails: setVapidDetailsMock,
  },
}));

vi.mock("./vapid-server-config", () => ({
  getVapidServerConfig: vi.fn(() => ({
    subject: "mailto:ops@example.com",
    publicKey: "public",
    privateKey: "private",
  })),
}));

import {
  resetWebPushVapidConfigurationForTests,
  sendWebPushNotification,
} from "./web-push-sender";

describe("sendWebPushNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetWebPushVapidConfigurationForTests();
  });

  it("serializes payload as JSON", async () => {
    sendNotificationMock.mockResolvedValue(undefined);

    const result = await sendWebPushNotification(
      {
        endpoint: "https://push.example/sub",
        keys: { p256dh: "p", auth: "a" },
      },
      {
        title: "Tabi",
        body: "You have a trip reminder",
        url: "/app/trips/abc",
        tag: "reminder-abc",
      },
    );

    expect(result).toEqual({ status: "success" });
    expect(sendNotificationMock).toHaveBeenCalledWith(
      {
        endpoint: "https://push.example/sub",
        keys: { p256dh: "p", auth: "a" },
      },
      JSON.stringify({
        title: "Tabi",
        body: "You have a trip reminder",
        url: "/app/trips/abc",
        tag: "reminder-abc",
      }),
    );
  });

  it("classifies expired subscriptions", async () => {
    sendNotificationMock.mockRejectedValue({ statusCode: 410 });

    const result = await sendWebPushNotification(
      {
        endpoint: "https://push.example/sub",
        keys: { p256dh: "p", auth: "a" },
      },
      { url: "/app" },
    );

    expect(result).toEqual({ status: "expired_subscription", statusCode: 410 });
  });
});
