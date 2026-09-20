import { describe, expect, it } from "vitest";
import { PUSH_NOTIFICATION_FALLBACK_URL } from "./push-notification-constants";
import { resolveNotificationClickUrl } from "./resolve-notification-click-url";

describe("resolveNotificationClickUrl", () => {
  it("preserves valid internal targets", () => {
    expect(resolveNotificationClickUrl({ url: "/app/trips/abc123" })).toBe(
      "/app/trips/abc123",
    );
  });

  it("falls back for invalid targets", () => {
    expect(resolveNotificationClickUrl({ url: "//evil.example.com" })).toBe(
      PUSH_NOTIFICATION_FALLBACK_URL,
    );
    expect(resolveNotificationClickUrl(null)).toBe(PUSH_NOTIFICATION_FALLBACK_URL);
  });
});
