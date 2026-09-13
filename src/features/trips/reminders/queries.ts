import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripReminder } from "@/models/TripReminder";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import {
  formatReminderDateLabel,
  formatReminderDisplayLine,
} from "./format-reminder";
import type { TripReminderViewModel } from "./types";

type TripReminderLean = {
  _id: { toString(): string };
  date: string;
  time: string;
  text: string;
  isCompleted: boolean;
};

function toTripReminderViewModel(
  reminder: TripReminderLean,
  todayJapan: string,
  t: ReturnType<typeof createAppTranslator<"TripReminders">>,
): TripReminderViewModel {
  return {
    id: reminder._id.toString(),
    date: reminder.date,
    time: reminder.time,
    text: reminder.text,
    isCompleted: reminder.isCompleted,
    dateLabel: formatReminderDateLabel(reminder.date, todayJapan, t),
    displayLine: formatReminderDisplayLine(
      reminder.date,
      reminder.time,
      todayJapan,
      t,
    ),
  };
}

export async function listRemindersForUserTrip(
  tripId: string,
  userId: string,
  todayJapan: string,
): Promise<TripReminderViewModel[]> {
  const locale = await resolveRequestLocale();
  const t = createAppTranslator("TripReminders", locale);

  await connectDb();
  const reminders = await TripReminder.find({ tripId, userId })
    .sort({ date: 1, time: 1, _id: 1 })
    .lean();

  return reminders.map((reminder) => toTripReminderViewModel(reminder, todayJapan, t));
}

export async function listRemindersForUserTripDay(
  tripId: string,
  userId: string,
  date: string,
  todayJapan: string,
): Promise<TripReminderViewModel[]> {
  const locale = await resolveRequestLocale();
  const t = createAppTranslator("TripReminders", locale);

  await connectDb();
  const reminders = await TripReminder.find({ tripId, userId, date })
    .sort({ isCompleted: 1, time: 1, _id: 1 })
    .lean();

  return reminders.map((reminder) => toTripReminderViewModel(reminder, todayJapan, t));
}

export async function listIncompleteRemindersForUserTripDay(
  tripId: string,
  userId: string,
  date: string,
): Promise<
  Array<{
    id: string;
    date: string;
    time: string;
    text: string;
    isCompleted: boolean;
  }>
> {
  await connectDb();
  const reminders = await TripReminder.find({
    tripId,
    userId,
    date,
    isCompleted: false,
  })
    .sort({ time: 1, _id: 1 })
    .lean();

  return reminders.map((reminder) => ({
    id: reminder._id.toString(),
    date: reminder.date,
    time: reminder.time,
    text: reminder.text,
    isCompleted: reminder.isCompleted,
  }));
}

export async function listIncompleteRemindersForUserTrip(
  tripId: string,
  userId: string,
): Promise<
  Array<{
    id: string;
    date: string;
    time: string;
    text: string;
    isCompleted: boolean;
  }>
> {
  await connectDb();
  const reminders = await TripReminder.find({
    tripId,
    userId,
    isCompleted: false,
  })
    .sort({ date: 1, time: 1, _id: 1 })
    .lean();

  return reminders.map((reminder) => ({
    id: reminder._id.toString(),
    date: reminder.date,
    time: reminder.time,
    text: reminder.text,
    isCompleted: reminder.isCompleted,
  }));
}

export async function getReminderForUser(
  tripId: string,
  userId: string,
  reminderId: string,
): Promise<TripReminderLean | null> {
  await connectDb();
  return TripReminder.findOne({ _id: reminderId, tripId, userId }).lean();
}
