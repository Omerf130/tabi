import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Push N5 integrity", () => {
  it("polishes notifications settings without touching delivery infrastructure", () => {
    const settings = readFileSync(
      join(root, "src/features/push/NotificationsSettings.client.tsx"),
      "utf8",
    );
    expect(settings).toContain('aria-live="polite"');
    expect(settings).toContain("PwaInstallAction");
    expect(settings).not.toContain("web-push");
  });

  it("does not modify service worker or scheduler routes", () => {
    const sw = readFileSync(join(root, "src/app/sw.ts"), "utf8");
    const scheduler = readFileSync(
      join(root, "src/app/api/internal/reminder-notifications/route.ts"),
      "utf8",
    );
    expect(sw).toContain("registerTabiPushNotificationListeners");
    expect(scheduler).toContain("deliverDueReminderNotifications");
  });
});
