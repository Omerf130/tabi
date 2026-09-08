import { describe, expect, it } from "vitest";
import {
  canOpenReminderPanel,
  getNextReminderIndex,
  shouldAutoRotateReminders,
} from "./home-reminder-rotation";

describe("home reminder rotation", () => {
  it("wraps from last reminder back to first", () => {
    expect(getNextReminderIndex(0, 3)).toBe(1);
    expect(getNextReminderIndex(1, 3)).toBe(2);
    expect(getNextReminderIndex(2, 3)).toBe(0);
  });

  it("does not rotate with fewer than two reminders", () => {
    expect(shouldAutoRotateReminders(0, false)).toBe(false);
    expect(shouldAutoRotateReminders(1, false)).toBe(false);
    expect(shouldAutoRotateReminders(2, false)).toBe(true);
  });

  it("disables auto rotation when reduced motion is preferred", () => {
    expect(shouldAutoRotateReminders(3, true)).toBe(false);
  });

  it("allows opening the panel only when reminders exist", () => {
    expect(canOpenReminderPanel(0)).toBe(false);
    expect(canOpenReminderPanel(1)).toBe(true);
    expect(canOpenReminderPanel(3)).toBe(true);
  });
});
