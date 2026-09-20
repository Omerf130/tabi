import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripMember } from "@/models/TripMember";
import { Trip } from "@/models/Trip";
import { TripReminder } from "@/models/TripReminder";
import type { ClaimedReminderNotification } from "./reminder-notification-claim";

export type ReminderSendValidationSkipReason =
  | "missing"
  | "completed"
  | "already_sent"
  | "schedule_changed"
  | "trip_missing"
  | "no_trip_access";

export type ReminderSendValidationResult =
  | { ok: true; reminder: ClaimedReminderNotification }
  | { ok: false; reason: ReminderSendValidationSkipReason };

export async function validateClaimedReminderBeforeSend(
  claimed: ClaimedReminderNotification,
): Promise<ReminderSendValidationResult> {
  await connectDb();
  const reminder = await TripReminder.findById(claimed.id)
    .select("_id tripId userId scheduledAtUtc isCompleted notificationSentAt")
    .lean();

  if (!reminder) {
    return { ok: false, reason: "missing" };
  }

  if (reminder.isCompleted) {
    return { ok: false, reason: "completed" };
  }

  if (reminder.notificationSentAt) {
    return { ok: false, reason: "already_sent" };
  }

  const currentScheduled = reminder.scheduledAtUtc as Date | undefined;
  if (
    !currentScheduled ||
    currentScheduled.getTime() !== claimed.scheduledAtUtc.getTime()
  ) {
    return { ok: false, reason: "schedule_changed" };
  }

  const tripExists = await Trip.exists({ _id: claimed.tripId });
  if (!tripExists) {
    return { ok: false, reason: "trip_missing" };
  }

  const membership = await TripMember.findOne({
    tripId: claimed.tripId,
    userId: claimed.userId,
  }).lean();

  if (!membership) {
    return { ok: false, reason: "no_trip_access" };
  }

  return {
    ok: true,
    reminder: {
      id: claimed.id,
      tripId: claimed.tripId,
      userId: claimed.userId,
      scheduledAtUtc: currentScheduled,
    },
  };
}
