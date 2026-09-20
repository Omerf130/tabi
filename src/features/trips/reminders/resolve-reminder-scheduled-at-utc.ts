import { isValidIanaTimeZone } from "@/features/trips/destination/is-valid-iana-time-zone";
import {
  getCalendarDateInTimeZone,
  getWallClockTimeInTimeZone,
} from "@/features/trips/destination/trip-local-calendar";

export type ResolveReminderScheduledAtUtcInput = {
  date: string;
  time: string;
  timeZone: string;
};

export type ResolveReminderScheduledAtUtcResult =
  | { ok: true; scheduledAtUtc: Date }
  | { ok: false; reason: "invalidTimeZone" | "nonexistentLocalTime" };

const SEARCH_WINDOW_MS = 36 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/**
 * Converts a user-authored local date/time in an IANA zone to the earliest matching UTC instant.
 *
 * DST policy:
 * - Nonexistent local times (spring forward gap): rejected.
 * - Ambiguous local times (fall back): earliest UTC instant that maps to the wall time.
 */
export function resolveReminderScheduledAtUtc(
  input: ResolveReminderScheduledAtUtcInput,
): ResolveReminderScheduledAtUtcResult {
  const timeZone = input.timeZone.trim();
  if (!isValidIanaTimeZone(timeZone)) {
    return { ok: false, reason: "invalidTimeZone" };
  }

  const [yearText, monthText, dayText] = input.date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const [hourText, minuteText] = input.time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return { ok: false, reason: "nonexistentLocalTime" };
  }

  const centerUtc = Date.UTC(year, month - 1, day, 12, 0, 0);
  let firstMatch: Date | null = null;

  for (
    let instantMs = centerUtc - SEARCH_WINDOW_MS;
    instantMs <= centerUtc + SEARCH_WINDOW_MS;
    instantMs += MINUTE_MS
  ) {
    const instant = new Date(instantMs);
    if (
      getCalendarDateInTimeZone(timeZone, instant) === input.date &&
      getWallClockTimeInTimeZone(timeZone, instant) === input.time
    ) {
      firstMatch = instant;
      break;
    }
  }

  if (!firstMatch) {
    return { ok: false, reason: "nonexistentLocalTime" };
  }

  return { ok: true, scheduledAtUtc: firstMatch };
}

export function resolveReminderSchedule(input: ResolveReminderScheduledAtUtcInput): {
  timeZone: string;
  scheduledAtUtc: Date;
} | ResolveReminderScheduledAtUtcResult {
  const timeZone = input.timeZone.trim();
  const resolved = resolveReminderScheduledAtUtc(input);
  if (!resolved.ok) {
    return resolved;
  }
  return {
    timeZone,
    scheduledAtUtc: resolved.scheduledAtUtc,
  };
}
