import "server-only";

import { compareCalendarDates } from "@/features/trips/calendar-date";
import { connectDb } from "@/lib/db/connect";
import { TripReminder } from "@/models/TripReminder";
import { isDateWithinTrip } from "@/features/trips/trip-days";
import { TRIP_REMINDER_MESSAGES } from "./constants";

export class TripReminderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TripReminderValidationError";
  }
}

export class TripReminderNotFoundError extends Error {
  constructor() {
    super(TRIP_REMINDER_MESSAGES.notFound);
    this.name = "TripReminderNotFoundError";
  }
}

function assertReminderDateInTrip(
  date: string,
  startDate: string,
  endDate: string,
): void {
  if (!isDateWithinTrip(startDate, endDate, date)) {
    throw new TripReminderValidationError(TRIP_REMINDER_MESSAGES.dateOutOfRange);
  }
}

export async function createTripReminder(input: {
  tripId: string;
  userId: string;
  startDate: string;
  endDate: string;
  date: string;
  time: string;
  text: string;
}): Promise<string> {
  assertReminderDateInTrip(input.date, input.startDate, input.endDate);
  await connectDb();
  const created = await TripReminder.create({
    tripId: input.tripId,
    userId: input.userId,
    date: input.date,
    time: input.time,
    text: input.text,
    isCompleted: false,
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
}): Promise<void> {
  assertReminderDateInTrip(input.date, input.startDate, input.endDate);
  await connectDb();
  const updated = await TripReminder.findOneAndUpdate(
    { _id: input.reminderId, tripId: input.tripId, userId: input.userId },
    { date: input.date, time: input.time, text: input.text },
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

export function compareTripReminders<
  T extends { date: string; time: string; id: string },
>(a: T, b: T): number {
  const byDate = compareCalendarDates(a.date, b.date);
  if (byDate !== 0) {
    return byDate;
  }

  if (a.time !== b.time) {
    return a.time < b.time ? -1 : 1;
  }

  return a.id.localeCompare(b.id);
}
