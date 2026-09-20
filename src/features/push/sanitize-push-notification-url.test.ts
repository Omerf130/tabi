import { describe, expect, it } from "vitest";
import { PUSH_NOTIFICATION_FALLBACK_URL } from "./push-notification-constants";
import { sanitizePushNotificationInternalUrl } from "./sanitize-push-notification-url";

describe("sanitizePushNotificationInternalUrl", () => {
  it("accepts /app and trip routes", () => {
    expect(sanitizePushNotificationInternalUrl("/app")).toBe("/app");
    expect(sanitizePushNotificationInternalUrl("/app/trips/abc123")).toBe(
      "/app/trips/abc123",
    );
    expect(
      sanitizePushNotificationInternalUrl("/app/trips/507f1f77bcf86cd799439011"),
    ).toBe("/app/trips/507f1f77bcf86cd799439011");
  });

  it("rejects external and dangerous URLs", () => {
    expect(sanitizePushNotificationInternalUrl("https://evil.example.com")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(sanitizePushNotificationInternalUrl("http://evil.example.com")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(sanitizePushNotificationInternalUrl("//evil.example.com")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(sanitizePushNotificationInternalUrl("javascript:alert(1)")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(
      sanitizePushNotificationInternalUrl("data:text/html,<script>alert(1)</script>"),
    ).toBe(PUSH_NOTIFICATION_FALLBACK_URL);
  });

  it("rejects empty and non-app paths", () => {
    expect(sanitizePushNotificationInternalUrl("")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(sanitizePushNotificationInternalUrl("/")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(sanitizePushNotificationInternalUrl("/login")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
  });

  it("rejects path traversal and backslashes", () => {
    expect(sanitizePushNotificationInternalUrl("/app/../evil")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(sanitizePushNotificationInternalUrl("/app\\trips\\x")).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
  });
});
