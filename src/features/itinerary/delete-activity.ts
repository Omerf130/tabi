import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { ActivityNotFoundError } from "./errors";
import type { DeleteActivityInput } from "./schemas";

export async function deleteActivity(input: DeleteActivityInput): Promise<string> {
  await connectDb();
  const existing = await Activity.findOne({
    _id: input.activityId,
    tripId: input.tripId,
  })
    .select("date")
    .lean();

  if (!existing) {
    throw new ActivityNotFoundError();
  }

  const result = await Activity.deleteOne({
    _id: input.activityId,
    tripId: input.tripId,
  });

  if (result.deletedCount !== 1) {
    throw new ActivityNotFoundError();
  }

  return existing.date;
}
