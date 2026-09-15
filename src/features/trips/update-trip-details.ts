import "server-only";

import { revalidatePath } from "next/cache";
import { resolveDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";
import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { requireTripOwner } from "./authorization";
import { resolveCoverVisualKeyForDestination } from "./resolve-cover-visual-key";
import type {
  UpdateTripDestinationInput,
  UpdateTripIdentityInput,
} from "./schemas";

function revalidateTripDetailsSurfaces(tripId: string): void {
  revalidateTripManagement(tripId, "details");
  revalidatePath(`/app/trips/${tripId}`);
  revalidatePath("/app");
}

export async function updateTripIdentity(
  input: UpdateTripIdentityInput,
): Promise<void> {
  await requireTripOwner(input.tripId);
  await connectDb();

  const result = await Trip.findByIdAndUpdate(
    input.tripId,
    {
      $set: {
        name: input.name,
        description: input.description,
      },
    },
    { runValidators: true },
  );

  if (!result) {
    throw new Error("Trip not found");
  }

  revalidateTripDetailsSurfaces(input.tripId);
}

export async function updateTripDestination(
  input: UpdateTripDestinationInput,
): Promise<void> {
  await requireTripOwner(input.tripId);
  await connectDb();

  const trip = await Trip.findById(input.tripId).lean();
  if (!trip) {
    throw new Error("Trip not found");
  }

  const destination = await resolveDestinationSnapshot(input.googlePlaceId);

  const update: Record<string, unknown> = {
    destination,
  };

  if (!trip.coverImage) {
    update.coverVisualKey = resolveCoverVisualKeyForDestination(destination);
  }

  const result = await Trip.findByIdAndUpdate(
    input.tripId,
    { $set: update },
    { runValidators: true },
  );

  if (!result) {
    throw new Error("Trip not found");
  }

  revalidateTripDetailsSurfaces(input.tripId);
}
