import "server-only";

import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { Activity } from "@/models/Activity";
import {
  getReorderNeighborId,
  sortActivitiesForDisplay,
} from "./activity-order";
import { ActivityNotFoundError } from "./errors";
import type { ReorderActivityInput } from "./schemas";

export async function reorderActivity(input: ReorderActivityInput): Promise<void> {
  await connectDb();

  const source = await Activity.findOne({
    _id: input.activityId,
    tripId: input.tripId,
  }).lean();

  if (!source) {
    throw new ActivityNotFoundError();
  }

  const dayActivities = await Activity.find({
    tripId: input.tripId,
    date: source.date,
  }).lean();

  const orderRecords = dayActivities.map((activity) => ({
    id: activity._id.toString(),
    order: activity.order,
    createdAt: activity.createdAt,
  }));

  const neighborId = getReorderNeighborId(
    orderRecords,
    input.activityId,
    input.direction,
  );

  if (!neighborId) {
    return;
  }

  const neighbor = dayActivities.find(
    (activity) => activity._id.toString() === neighborId,
  );
  if (!neighbor) {
    return;
  }

  const sourceOrder = source.order;
  const neighborOrder = neighbor.order;

  await withTransaction(async (session) => {
    await Activity.updateOne(
      { _id: source._id, tripId: input.tripId },
      { $set: { order: neighborOrder } },
      { session },
    );
    await Activity.updateOne(
      { _id: neighbor._id, tripId: input.tripId },
      { $set: { order: sourceOrder } },
      { session },
    );
  });
}

export function sortDayActivityRecords<
  T extends { order: number; createdAt: Date | string; _id: { toString(): string } },
>(activities: readonly T[]): T[] {
  return sortActivitiesForDisplay(
    activities.map((activity) => ({
      id: activity._id.toString(),
      order: activity.order,
      createdAt: activity.createdAt,
    })),
  ).map((sorted) =>
    activities.find((activity) => activity._id.toString() === sorted.id)!,
  );
}
