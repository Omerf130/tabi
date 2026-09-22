import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("trip home reminders UI contracts", () => {
  it("opens the reminders manager from Home without navigating to manage/reminders", () => {
    const content = readFileSync(
      join(process.cwd(), "src/features/trip-home/TripHomeContent.tsx"),
      "utf8",
    );
    const importantToday = readFileSync(
      join(process.cwd(), "src/features/trip-home/TodayRemindersSection.tsx"),
      "utf8",
    );
    const beforeReminders = readFileSync(
      join(process.cwd(), "src/features/trip-home/BeforeTripRemindersSection.client.tsx"),
      "utf8",
    );

    expect(content).toContain("TripHomeRemindersHost");
    expect(importantToday).toContain("openManager");
    expect(importantToday).not.toContain("ReminderPanel");
    expect(importantToday).not.toContain("manage/reminders");
    expect(beforeReminders).toContain("openManager");
    expect(beforeReminders).not.toContain("manage/reminders");
  });

  it("keeps create and edit inside the same manager modal", () => {
    const manager = readFileSync(
      join(process.cwd(), "src/features/trip-home/TripHomeRemindersManager.client.tsx"),
      "utf8",
    );

    expect(manager).toContain('setView("create")');
    expect(manager).toContain('setView("edit")');
    expect(manager).toContain("ReminderFormView");
    expect(manager).toContain("ReminderPushAwarenessCallout");
    expect(manager).not.toMatch(/showModal\(\)[\s\S]*showModal\(\)/);
  });

  it("uses generic currentTripDate in manager data", () => {
    const types = readFileSync(
      join(process.cwd(), "src/features/trip-home/types.ts"),
      "utf8",
    );
    const buildVm = readFileSync(
      join(process.cwd(), "src/features/trip-home/build-trip-home-view-model.ts"),
      "utf8",
    );

    expect(types).toContain("currentTripDate");
    expect(buildVm).toMatch(
      /function buildRemindersManager[\s\S]*currentTripDate,\s*\n\s*reminders:/,
    );
    expect(buildVm).toMatch(
      /remindersManager: buildRemindersManager\(input, todayTripLocal\)/,
    );
  });
});
