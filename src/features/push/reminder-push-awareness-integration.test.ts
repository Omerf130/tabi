import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildAccountNotificationsHref } from "./account-notifications-routes";

const root = process.cwd();

describe("ReminderPushAwarenessCallout integration", () => {
  it("uses buildAccountNotificationsHref for contextual links", () => {
    const source = readFileSync(
      join(root, "src/features/push/ReminderPushAwarenessCallout.client.tsx"),
      "utf8",
    );
    expect(source).toContain("buildAccountNotificationsHref");
    expect(source).toContain('role="note"');
    expect(source).not.toContain("enablePushNotificationsOnDevice");
    expect(source).not.toContain("requestNotificationPermission");
  });

  it("wires returnTo in reminder surfaces", () => {
    const quickAdd = readFileSync(
      join(root, "src/features/quick-add/QuickAddForms.client.tsx"),
      "utf8",
    );
    const tripHome = readFileSync(
      join(root, "src/features/trip-home/TripHomeRemindersManager.client.tsx"),
      "utf8",
    );
    const settings = readFileSync(
      join(root, "src/features/trips/reminders/TripReminderSettings.tsx"),
      "utf8",
    );
    const dayEdit = readFileSync(
      join(root, "src/features/itinerary/DayActionSurface.client.tsx"),
      "utf8",
    );

    expect(quickAdd).toContain("ReminderPushAwarenessCallout");
    expect(quickAdd).toContain("originPath");
    expect(tripHome).toContain("/app/trips/${managerData.tripId}");
    expect(settings).toContain("/app/trips/${tripId}/manage/reminders");
    expect(dayEdit).toContain("reminderNotificationsReturnTo");
  });

  it("builds safe notification hrefs for representative contexts", () => {
    const tripId = "507f1f77bcf86cd799439011";
    expect(buildAccountNotificationsHref(`/app/trips/${tripId}/manage`)).toBe(
      `/app/account/notifications?returnTo=${encodeURIComponent(`/app/trips/${tripId}/manage`)}`,
    );
    expect(buildAccountNotificationsHref("https://evil.example")).toBe(
      "/app/account/notifications",
    );
  });
});
