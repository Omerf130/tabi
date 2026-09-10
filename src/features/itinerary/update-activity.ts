import "server-only";

import type { ActivityCostCategory } from "@/features/finance/entity-cost-schema";
import { syncLinkedTripExpense } from "@/features/finance/finance-linked-expense-domain";
import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { Activity } from "@/models/Activity";
import { isDateWithinTrip } from "@/features/trips/trip-days";
import { getNextActivityOrder } from "./activity-order";
import {
  ActivityDateOutOfRangeError,
  ActivityNotFoundError,
  ActivityValidationError,
} from "./errors";
import { listActivitiesForTripDay } from "./queries";
import { toActivityDocumentFields } from "./activity-document-fields";
import type { UpdateActivityInput } from "./schemas";
import { validateActivityTimes } from "./time";

type TripDateRange = {
  id: string;
  startDate: string;
  endDate: string;
};

export type ActivityCostInput = {
  amount: number;
  currency: string;
  category: ActivityCostCategory;
};

export async function updateActivity(
  trip: TripDateRange,
  input: UpdateActivityInput,
  costSync?: ActivityCostInput | null,
): Promise<string> {
  if (!isDateWithinTrip(trip.startDate, trip.endDate, input.date)) {
    throw new ActivityDateOutOfRangeError();
  }

  if (!validateActivityTimes(input.startTime, input.endTime)) {
    throw new ActivityValidationError("invalid activity times");
  }

  return withTransaction(async (session) => {
    await connectDb();
    const existing = await Activity.findOne({
      _id: input.activityId,
      tripId: trip.id,
    })
      .session(session)
      .lean();

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

    const locationFields = toActivityDocumentFields(input);

    const updated = await Activity.findOneAndUpdate(
      { _id: input.activityId, tripId: trip.id },
      {
        date: input.date,
        title: input.title,
        type: input.type,
        order,
        startTime: input.startTime ?? null,
        endTime: input.endTime ?? null,
        notes: input.notes ?? null,
        ...locationFields,
      },
      { new: true, session },
    ).lean();

    if (!updated) {
      throw new ActivityNotFoundError();
    }

    if (costSync !== undefined) {
      await syncLinkedTripExpense({
        tripId: trip.id,
        sourceType: "activity",
        sourceId: input.activityId,
        category: costSync?.category ?? "activities",
        expenseDate: input.date,
        cost: costSync ? { amount: costSync.amount, currency: costSync.currency } : null,
        session,
      });
    }

    return updated.date;
  });
}
