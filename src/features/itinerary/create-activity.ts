import "server-only";

import mongoose from "mongoose";
import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { isDateWithinTrip } from "@/features/trips/trip-days";
import { getNextActivityOrder } from "./activity-order";
import {
  ActivityDateOutOfRangeError,
  ActivityNotFoundError,
  ActivityValidationError,
} from "./errors";
import { toActivityDocumentFields } from "./activity-document-fields";
import { listActivitiesForTripDay } from "./queries";
import type { CreateActivityInput } from "./schemas";
import { validateActivityTimes } from "./time";

type TripDateRange = {
  startDate: string;
  endDate: string;
};

function assertDateWithinTrip(trip: TripDateRange, date: string): void {
  if (!isDateWithinTrip(trip.startDate, trip.endDate, date)) {
    throw new ActivityDateOutOfRangeError();
  }
}

function normalizeCoreFields(input: {
  startTime?: string;
  endTime?: string;
  notes?: string;
}) {
  if (!validateActivityTimes(input.startTime, input.endTime)) {
    throw new ActivityValidationError("invalid activity times");
  }

  return {
    startTime: input.startTime ?? null,
    endTime: input.endTime ?? null,
    notes: input.notes ?? null,
  };
}

export async function createActivity(
  trip: TripDateRange & { id: string },
  input: CreateActivityInput,
): Promise<string> {
  assertDateWithinTrip(trip, input.date);
  const coreFields = normalizeCoreFields(input);
  const locationFields = toActivityDocumentFields(input);

  await connectDb();
  const dayActivities = await listActivitiesForTripDay(trip.id, input.date);
  const order = getNextActivityOrder(dayActivities);

  const activity = await Activity.create({
    tripId: new mongoose.Types.ObjectId(trip.id),
    date: input.date,
    title: input.title,
    type: input.type,
    order,
    ...coreFields,
    ...locationFields,
  });

  return activity._id.toString();
}

export async function getActivityDateForTrip(
  tripId: string,
  activityId: string,
): Promise<string> {
  await connectDb();
  const activity = await Activity.findOne({ _id: activityId, tripId })
    .select("date")
    .lean();
  if (!activity) {
    throw new ActivityNotFoundError();
  }
  return activity.date;
}
