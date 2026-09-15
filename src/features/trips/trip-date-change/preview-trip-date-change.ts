import "server-only";

import { createSignedPayloadToken } from "@/lib/crypto/signed-payload";
import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { requireTripOwner } from "@/features/trips/authorization";
import { TRIP_DATE_CHANGE_PREVIEW_VERSION } from "./constants";
import {
  computeTripDateChangeImpact,
  tripDatesAreUnchanged,
} from "./compute-trip-date-change-impact";
import type { TripDateChangePreviewResult } from "./trip-date-change-types";
import { TripDateChangeNoChangeError, TripDateChangeNotFoundError } from "./errors";

export async function previewTripDateChange(input: {
  tripId: string;
  startDate: string;
  endDate: string;
}): Promise<TripDateChangePreviewResult> {
  await requireTripOwner(input.tripId);
  await connectDb();

  const trip = await Trip.findById(input.tripId).select("startDate endDate updatedAt").lean();
  if (!trip) {
    throw new TripDateChangeNotFoundError();
  }

  if (
    tripDatesAreUnchanged(
      trip.startDate,
      trip.endDate,
      input.startDate,
      input.endDate,
    )
  ) {
    throw new TripDateChangeNoChangeError();
  }

  const impactPlan = await computeTripDateChangeImpact({
    tripId: input.tripId,
    oldStartDate: trip.startDate,
    oldEndDate: trip.endDate,
    newStartDate: input.startDate,
    newEndDate: input.endDate,
  });

  const previewToken = createSignedPayloadToken({
    v: TRIP_DATE_CHANGE_PREVIEW_VERSION,
    tripId: input.tripId,
    tripUpdatedAt: trip.updatedAt.toISOString(),
    newStartDate: input.startDate,
    newEndDate: input.endDate,
    impactHash: impactPlan.impactHash,
  });

  return {
    impact: {
      oldStartDate: impactPlan.oldStartDate,
      oldEndDate: impactPlan.oldEndDate,
      newStartDate: impactPlan.newStartDate,
      newEndDate: impactPlan.newEndDate,
      activitiesToDelete: impactPlan.activitiesToDelete,
      accommodationsToDelete: impactPlan.accommodationsToDelete,
      accommodationsToClamp: impactPlan.accommodationsToClamp,
      transportsToReview: impactPlan.transportsToReview,
      remindersOutOfRange: impactPlan.remindersOutOfRange,
      manualExpensesOutOfRange: impactPlan.manualExpensesOutOfRange,
      documentsUnlinkedCount: impactPlan.documentsUnlinkedCount,
    },
    previewToken,
    requiresConfirmation: impactPlan.requiresConfirmation,
  };
}
