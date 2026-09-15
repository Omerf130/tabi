import "server-only";

import type { ClientSession } from "mongoose";
import { deleteAccommodationInSession } from "@/features/accommodations/accommodation-domain";
import { syncLinkedTripExpense } from "@/features/finance/finance-linked-expense-domain";
import { deleteActivityInSession } from "@/features/itinerary/delete-activity";
import { verifySignedPayloadToken } from "@/lib/crypto/signed-payload";
import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { Accommodation } from "@/models/Accommodation";
import { Trip } from "@/models/Trip";
import { TripExpense } from "@/models/TripExpense";
import { requireTripOwner } from "@/features/trips/authorization";
import { TRIP_DATE_CHANGE_PREVIEW_VERSION } from "./constants";
import { computeTripDateChangeImpact } from "./compute-trip-date-change-impact";
import {
  TripDateChangeInvalidPreviewTokenError,
  TripDateChangeNotFoundError,
  TripDateChangeStalePreviewError,
} from "./errors";
import { revalidateTripDateChangeSurfaces } from "./revalidation";
import type { TripDateChangeAccommodationClampItem } from "./trip-date-change-types";

type PreviewTokenPayload = {
  v: number;
  tripId: string;
  tripUpdatedAt: string;
  newStartDate: string;
  newEndDate: string;
  impactHash: string;
};

async function clampAccommodationInSession(
  session: ClientSession,
  tripId: string,
  item: TripDateChangeAccommodationClampItem,
): Promise<void> {
  const updated = await Accommodation.findOneAndUpdate(
    { _id: item.id, tripId },
    {
      $set: {
        checkInDate: item.toCheckInDate,
        checkOutDate: item.toCheckOutDate,
      },
    },
    { new: true, session },
  ).lean();

  if (!updated) {
    throw new TripDateChangeStalePreviewError();
  }

  const linked = await TripExpense.findOne({
    tripId,
    sourceType: "accommodation",
    sourceId: item.id,
  })
    .session(session)
    .lean();

  if (!linked) {
    return;
  }

  await syncLinkedTripExpense({
    tripId,
    sourceType: "accommodation",
    sourceId: item.id,
    category: "accommodation",
    expenseDate: item.toCheckInDate,
    cost: {
      amount: linked.originalAmount,
      currency: linked.originalCurrency,
    },
    session,
  });
}

export async function applyTripDateChange(input: {
  tripId: string;
  previewToken: string;
}): Promise<void> {
  await requireTripOwner(input.tripId);

  const payload = verifySignedPayloadToken<PreviewTokenPayload>(input.previewToken);
  if (
    !payload ||
    payload.v !== TRIP_DATE_CHANGE_PREVIEW_VERSION ||
    payload.tripId !== input.tripId ||
    typeof payload.tripUpdatedAt !== "string" ||
    typeof payload.newStartDate !== "string" ||
    typeof payload.newEndDate !== "string" ||
    typeof payload.impactHash !== "string"
  ) {
    throw new TripDateChangeInvalidPreviewTokenError();
  }

  await connectDb();
  const trip = await Trip.findById(input.tripId)
    .select("startDate endDate updatedAt")
    .lean();
  if (!trip) {
    throw new TripDateChangeNotFoundError();
  }

  if (trip.updatedAt.toISOString() !== payload.tripUpdatedAt) {
    throw new TripDateChangeStalePreviewError();
  }

  const impactPlan = await computeTripDateChangeImpact({
    tripId: input.tripId,
    oldStartDate: trip.startDate,
    oldEndDate: trip.endDate,
    newStartDate: payload.newStartDate,
    newEndDate: payload.newEndDate,
  });

  if (impactPlan.impactHash !== payload.impactHash) {
    throw new TripDateChangeStalePreviewError();
  }

  const affectedItineraryDates = new Set<string>([
    trip.startDate,
    trip.endDate,
    payload.newStartDate,
    payload.newEndDate,
    ...impactPlan.activitiesToDelete.map((item) => item.date),
  ]);

  await withTransaction(async (session) => {
    const lockedTrip = await Trip.findById(input.tripId)
      .select("startDate endDate updatedAt")
      .session(session)
      .lean();

    if (
      !lockedTrip ||
      lockedTrip.updatedAt.toISOString() !== payload.tripUpdatedAt
    ) {
      throw new TripDateChangeStalePreviewError();
    }

    const lockedImpact = await computeTripDateChangeImpact({
      tripId: input.tripId,
      oldStartDate: lockedTrip.startDate,
      oldEndDate: lockedTrip.endDate,
      newStartDate: payload.newStartDate,
      newEndDate: payload.newEndDate,
    });

    if (lockedImpact.impactHash !== payload.impactHash) {
      throw new TripDateChangeStalePreviewError();
    }

    await Trip.findByIdAndUpdate(
      input.tripId,
      {
        $set: {
          startDate: payload.newStartDate,
          endDate: payload.newEndDate,
        },
      },
      { session, runValidators: true },
    );

    for (const activity of lockedImpact.activitiesToDelete) {
      await deleteActivityInSession(session, {
        tripId: input.tripId,
        activityId: activity.id,
      });
    }

    for (const accommodation of lockedImpact.accommodationsToDelete) {
      await deleteAccommodationInSession(session, {
        tripId: input.tripId,
        accommodationId: accommodation.id,
      });
    }

    for (const accommodation of lockedImpact.accommodationsToClamp) {
      await clampAccommodationInSession(session, input.tripId, accommodation);
    }
  });

  revalidateTripDateChangeSurfaces(input.tripId, [...affectedItineraryDates]);
}
