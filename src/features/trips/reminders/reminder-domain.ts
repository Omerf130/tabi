import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripReminder } from "@/models/TripReminder";
import { isDateWithinTrip } from "@/features/trips/trip-days";
import {
  TRIP_REMINDER_ERROR_CODES,
  type TripReminderErrorCode,
} from "./constants";
import { resolveReminderScheduledAtUtc } from "./resolve-reminder-scheduled-at-utc";

export class TripReminderValidationError extends Error {
  readonly code: TripReminderErrorCode;

  constructor(code: TripReminderErrorCode) {
    super(code);
    this.name = "TripReminderValidationError";
    this.code = code;
  }
}

export class TripReminderNotFoundError extends Error {
  readonly code: TripReminderErrorCode;

  constructor() {
    super(TRIP_REMINDER_ERROR_CODES.notFound);
    this.name = "TripReminderNotFoundError";
    this.code = TRIP_REMINDER_ERROR_CODES.notFound;
  }
}

function assertReminderDateInTrip(
  date: string,
  startDate: string,
  endDate: string,
): void {
  if (!isDateWithinTrip(startDate, endDate, date)) {
    throw new TripReminderValidationError(TRIP_REMINDER_ERROR_CODES.dateOutOfRange);
  }
}

function assertResolvedReminderSchedule(input: {
  date: string;
  time: string;
  timeZone: string;
}): { timeZone: string; scheduledAtUtc: Date } {
  const timeZone = input.timeZone.trim();
  const resolved = resolveReminderScheduledAtUtc({
    date: input.date,
    time: input.time,
    timeZone,
  });
  if (!resolved.ok) {
    if (resolved.reason === "invalidTimeZone") {
      throw new TripReminderValidationError(TRIP_REMINDER_ERROR_CODES.invalidTimeZone);
    }
    throw new TripReminderValidationError(TRIP_REMINDER_ERROR_CODES.nonexistentLocalTime);
  }
  return { timeZone, scheduledAtUtc: resolved.scheduledAtUtc };
}

export async function createTripReminder(input: {
  tripId: string;
  userId: string;
  startDate: string;
  endDate: string;
  date: string;
  time: string;
  text: string;
  timeZone: string;
}): Promise<string> {
  assertReminderDateInTrip(input.date, input.startDate, input.endDate);
  const schedule = assertResolvedReminderSchedule({
    date: input.date,
    time: input.time,
    timeZone: input.timeZone,
  });
  await connectDb();
  const created = await TripReminder.create({
    tripId: input.tripId,
    userId: input.userId,
    date: input.date,
    time: input.time,
    text: input.text,
    isCompleted: false,
    timeZone: schedule.timeZone,
    scheduledAtUtc: schedule.scheduledAtUtc,
  });

  return created._id.toString();
}

export async function updateTripReminder(input: {
  tripId: string;
  userId: string;
  reminderId: string;
  startDate: string;
  endDate: string;
  date: string;
  time: string;
  text: string;
  timeZone: string;
}): Promise<void> {
  assertReminderDateInTrip(input.date, input.startDate, input.endDate);
  await connectDb();
  const existing = await TripReminder.findOne({
    _id: input.reminderId,
    tripId: input.tripId,
    userId: input.userId,
  }).lean();

  if (!existing) {
    throw new TripReminderNotFoundError();
  }

  const dateTimeUnchanged =
    existing.date === input.date && existing.time === input.time;

  let timeZone = existing.timeZone;
  let scheduledAtUtc = existing.scheduledAtUtc;

  if (!dateTimeUnchanged) {
    const schedule = assertResolvedReminderSchedule({
      date: input.date,
      time: input.time,
      timeZone: input.timeZone,
    });
    timeZone = schedule.timeZone;
    scheduledAtUtc = schedule.scheduledAtUtc;
  }

  const update: {
    $set: {
      date: string;
      time: string;
      text: string;
      timeZone?: string;
      scheduledAtUtc?: Date;
    };
    $unset?: { notificationClaimedAt: ""; notificationSentAt: "" };
  } = {
    $set: {
      date: input.date,
      time: input.time,
      text: input.text,
      timeZone: timeZone ?? undefined,
      scheduledAtUtc: scheduledAtUtc ?? undefined,
    },
  };

  if (!dateTimeUnchanged) {
    update.$unset = {
      notificationClaimedAt: "",
      notificationSentAt: "",
    };
  }

  const updated = await TripReminder.findOneAndUpdate(
    { _id: input.reminderId, tripId: input.tripId, userId: input.userId },
    update,
    { new: true },
  ).lean();

  if (!updated) {
    throw new TripReminderNotFoundError();
  }
}

export async function completeTripReminder(input: {
  tripId: string;
  userId: string;
  reminderId: string;
}): Promise<void> {
  await connectDb();
  const updated = await TripReminder.findOneAndUpdate(
    { _id: input.reminderId, tripId: input.tripId, userId: input.userId },
    { isCompleted: true },
    { new: true },
  ).lean();

  if (!updated) {
    throw new TripReminderNotFoundError();
  }
}

export async function deleteTripReminder(input: {
  tripId: string;
  userId: string;
  reminderId: string;
}): Promise<void> {
  await connectDb();
  const deleted = await TripReminder.findOneAndDelete({
    _id: input.reminderId,
    tripId: input.tripId,
    userId: input.userId,
  }).lean();

  if (!deleted) {
    throw new TripReminderNotFoundError();
  }
}

export { compareTripReminders } from "./compare-trip-reminders";
