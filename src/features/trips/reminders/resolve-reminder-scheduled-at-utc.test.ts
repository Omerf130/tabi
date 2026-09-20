import { describe, expect, it } from "vitest";
import {
  getCalendarDateInTimeZone,
  getWallClockTimeInTimeZone,
} from "@/features/trips/destination/trip-local-calendar";
import { resolveReminderScheduledAtUtc } from "./resolve-reminder-scheduled-at-utc";

function expectLocalWallTime(
  scheduledAtUtc: Date,
  timeZone: string,
  date: string,
  time: string,
): void {
  expect(getCalendarDateInTimeZone(timeZone, scheduledAtUtc)).toBe(date);
  expect(getWallClockTimeInTimeZone(timeZone, scheduledAtUtc)).toBe(time);
}

describe("resolveReminderScheduledAtUtc", () => {
  it("Israel user on Japan trip uses Asia/Jerusalem, not Asia/Tokyo", () => {
    const configuredTimeZone = "Asia/Jerusalem";
    const result = resolveReminderScheduledAtUtc({
      date: "2026-10-23",
      time: "09:00",
      timeZone: configuredTimeZone,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(configuredTimeZone).toBe("Asia/Jerusalem");
    expectLocalWallTime(result.scheduledAtUtc, "Asia/Jerusalem", "2026-10-23", "09:00");
    expect(result.scheduledAtUtc.toISOString()).toBe("2026-10-23T06:00:00.000Z");

    const tokyoMismatch = resolveReminderScheduledAtUtc({
      date: "2026-10-23",
      time: "09:00",
      timeZone: "Asia/Tokyo",
    });
    expect(tokyoMismatch.ok).toBe(true);
    if (tokyoMismatch.ok) {
      expect(result.scheduledAtUtc.getTime()).not.toBe(
        tokyoMismatch.scheduledAtUtc.getTime(),
      );
    }
  });

  it("user in Japan uses Asia/Tokyo for 09:00", () => {
    const result = resolveReminderScheduledAtUtc({
      date: "2026-10-23",
      time: "09:00",
      timeZone: "Asia/Tokyo",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.scheduledAtUtc.toISOString()).toBe("2026-10-23T00:00:00.000Z");
  });

  it("Italy trip does not affect New York configured reminder", () => {
    const result = resolveReminderScheduledAtUtc({
      date: "2026-06-15",
      time: "09:00",
      timeZone: "America/New_York",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expectLocalWallTime(result.scheduledAtUtc, "America/New_York", "2026-06-15", "09:00");
    expect(result.scheduledAtUtc.toISOString()).toBe("2026-06-15T13:00:00.000Z");
  });

  it("rejects nonexistent local time during spring-forward", () => {
    const result = resolveReminderScheduledAtUtc({
      date: "2026-03-08",
      time: "02:30",
      timeZone: "America/New_York",
    });

    expect(result).toEqual({ ok: false, reason: "nonexistentLocalTime" });
  });

  it("uses earliest UTC instant for ambiguous fall-back local time", () => {
    const result = resolveReminderScheduledAtUtc({
      date: "2026-11-01",
      time: "01:30",
      timeZone: "America/New_York",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expectLocalWallTime(result.scheduledAtUtc, "America/New_York", "2026-11-01", "01:30");
    expect(result.scheduledAtUtc.toISOString()).toBe("2026-11-01T05:30:00.000Z");
  });

  it("handles Europe/Rome DST summer offset", () => {
    const result = resolveReminderScheduledAtUtc({
      date: "2026-07-15",
      time: "09:00",
      timeZone: "Europe/Rome",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.scheduledAtUtc.toISOString()).toBe("2026-07-15T07:00:00.000Z");
  });
});
