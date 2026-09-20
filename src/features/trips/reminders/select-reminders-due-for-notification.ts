import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripReminder } from "@/models/TripReminder";

export type ReminderDueForNotification = {
  id: string;
  tripId: string;
  userId: string;
  scheduledAtUtc: Date;
};

/**
 * Future notification worker boundary (G2): reminders with a persisted UTC fire time.
 * Does not send notifications or track delivery state in G2.
 */
export async function listRemindersDueForNotification(
  asOf: Date,
): Promise<ReminderDueForNotification[]> {
  await connectDb();
  const reminders = await TripReminder.find({
    isCompleted: false,
    scheduledAtUtc: { $ne: null, $lte: asOf },
  })
    .select("_id tripId userId scheduledAtUtc")
    .sort({ scheduledAtUtc: 1, _id: 1 })
    .lean();

  return reminders.map((reminder) => ({
    id: reminder._id.toString(),
    tripId: reminder.tripId.toString(),
    userId: reminder.userId.toString(),
    scheduledAtUtc: reminder.scheduledAtUtc as Date,
  }));
}
