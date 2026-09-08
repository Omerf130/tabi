import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { isDateWithinTrip } from "@/features/trips/trip-days";
import { getNextActivityOrder } from "./activity-order";
import {
  ActivityDateOutOfRangeError,
  ActivityNotFoundError,
  ActivityValidationError,
} from "./errors";
import { listActivitiesForTripDay } from "./queries";
import type { UpdateActivityInput } from "./schemas";
import { validateActivityTimes } from "./time";

type TripDateRange = {
  id: string;
  startDate: string;
  endDate: string;
};

export async function updateActivity(
  trip: TripDateRange,
  input: UpdateActivityInput,
): Promise<string> {
  if (!isDateWithinTrip(trip.startDate, trip.endDate, input.date)) {
    throw new ActivityDateOutOfRangeError();
  }

  if (!validateActivityTimes(input.startTime, input.endTime)) {
    throw new ActivityValidationError("invalid activity times");
  }

  await connectDb();
  const existing = await Activity.findOne({
    _id: input.activityId,
    tripId: trip.id,
  }).lean();

  if (!existing) {
    throw new ActivityNotFoundError();
  }

  let order = existing.order;
  if (existing.date !== input.date) {
    const destinationActivities = await listActivitiesForTripDay(
      trip.id,
      input.date,
    );
    order = getNextActivityOrder(destinationActivities);
  }

  const updated = await Activity.findOneAndUpdate(
    { _id: input.activityId, tripId: trip.id },
    {
      date: input.date,
      title: input.title,
      type: input.type,
      order,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
      locationName: input.locationName ?? null,
      address: input.address ?? null,
      notes: input.notes ?? null,
    },
    { new: true },
  ).lean();

  if (!updated) {
    throw new ActivityNotFoundError();
  }

  return updated.date;
}
