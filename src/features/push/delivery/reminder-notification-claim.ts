import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripReminder } from "@/models/TripReminder";
import { REMINDER_NOTIFICATION_CLAIM_LEASE_MS } from "./constants";

export type ClaimedReminderNotification = {
  id: string;
  tripId: string;
  userId: string;
  scheduledAtUtc: Date;
};

function buildClaimableReminderFilter(now: Date) {
  const staleBefore = new Date(now.getTime() - REMINDER_NOTIFICATION_CLAIM_LEASE_MS);

  return {
    isCompleted: false,
    scheduledAtUtc: { $ne: null, $lte: now },
    $and: [
      {
        $or: [
          { notificationSentAt: { $exists: false } },
          { notificationSentAt: null },
        ],
      },
      {
        $or: [
          { notificationClaimedAt: { $exists: false } },
          { notificationClaimedAt: null },
          { notificationClaimedAt: { $lte: staleBefore } },
        ],
      },
    ],
  };
}

export function buildReminderNotificationClaimFilter(
  reminderId: string,
  now: Date,
): Record<string, unknown> {
  return {
    _id: reminderId,
    ...buildClaimableReminderFilter(now),
  };
}

/** Atomically claims one due reminder for delivery. Returns null if not claimable. */
export async function claimReminderNotification(
  reminderId: string,
  now: Date,
): Promise<ClaimedReminderNotification | null> {
  await connectDb();
  const claimed = await TripReminder.findOneAndUpdate(
    buildReminderNotificationClaimFilter(reminderId, now),
    { $set: { notificationClaimedAt: now } },
    { new: true },
  )
    .select("_id tripId userId scheduledAtUtc")
    .lean();

  if (!claimed?.scheduledAtUtc) {
    return null;
  }

  return {
    id: claimed._id.toString(),
    tripId: claimed.tripId.toString(),
    userId: claimed.userId.toString(),
    scheduledAtUtc: claimed.scheduledAtUtc as Date,
  };
}

export async function releaseReminderNotificationClaim(
  reminderId: string,
): Promise<void> {
  await connectDb();
  await TripReminder.updateOne(
    { _id: reminderId },
    { $unset: { notificationClaimedAt: "" } },
  );
}

export async function markReminderNotificationSent(input: {
  reminderId: string;
  claimedScheduledAtUtc: Date;
  sentAt: Date;
}): Promise<boolean> {
  await connectDb();
  const updated = await TripReminder.findOneAndUpdate(
    {
      _id: input.reminderId,
      scheduledAtUtc: input.claimedScheduledAtUtc,
      $or: [
        { notificationSentAt: { $exists: false } },
        { notificationSentAt: null },
      ],
    },
    {
      $set: { notificationSentAt: input.sentAt },
      $unset: { notificationClaimedAt: "" },
    },
    { new: true },
  ).lean();

  return Boolean(updated);
}
