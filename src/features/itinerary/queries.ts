import "server-only";

import { attachLinkedCostsToIds } from "@/features/finance/linked-expense-queries";
import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { toActivityViewModel } from "./to-activity-view-model";
import type { ActivityViewModel } from "./types";

export async function listActivitiesForTrip(
  tripId: string,
): Promise<ActivityViewModel[]> {
  await connectDb();
  const activities = await Activity.find({ tripId })
    .sort({ date: 1, order: 1, createdAt: 1, _id: 1 })
    .lean();

  const viewModels = activities.map((activity) => toActivityViewModel(activity));
  return attachLinkedCostsToIds(tripId, "activity", viewModels);
}

export async function getActivityForTrip(
  tripId: string,
  activityId: string,
): Promise<ActivityViewModel | null> {
  await connectDb();
  const activity = await Activity.findOne({ _id: activityId, tripId }).lean();
  if (!activity) {
    return null;
  }

  const viewModel = toActivityViewModel(activity);
  const [withCost] = await attachLinkedCostsToIds(tripId, "activity", [viewModel]);
  return withCost;
}

export async function listActivitiesForTripDay(
  tripId: string,
  date: string,
): Promise<ActivityViewModel[]> {
  await connectDb();
  const activities = await Activity.find({ tripId, date })
    .sort({ order: 1, createdAt: 1, _id: 1 })
    .lean();

  const viewModels = activities.map((activity) => toActivityViewModel(activity));
  return attachLinkedCostsToIds(tripId, "activity", viewModels);
}
