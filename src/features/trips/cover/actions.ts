"use server";

import { revalidatePath } from "next/cache";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";
import { requireTripOwner } from "@/features/trips/authorization";
import {
  cleanupTripCoverPathname,
  removeTripCoverImage,
  replaceTripCoverImage,
} from "./cover-domain";
import { TRIP_COVER_MESSAGES } from "./constants";
import { validateTripCoverUpload } from "./validate-trip-cover";

export type TripCoverActionState = {
  ok?: boolean;
  error?: string;
  success?: string;
};

export async function uploadTripCoverAction(
  _prev: TripCoverActionState,
  formData: FormData,
): Promise<TripCoverActionState> {
  const tripId = String(formData.get("tripId") ?? "");
  const file = formData.get("cover");

  if (!(file instanceof File)) {
    return { error: TRIP_COVER_MESSAGES.missingFile };
  }

  try {
    await requireTripOwner(tripId);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const validation = validateTripCoverUpload({
      size: file.size,
      bytes,
      declaredType: file.type,
    });

    if (!validation.ok) {
      if (validation.error === "tooLarge") {
        return { error: TRIP_COVER_MESSAGES.tooLarge };
      }
      if (validation.error === "missing") {
        return { error: TRIP_COVER_MESSAGES.missingFile };
      }
      return { error: TRIP_COVER_MESSAGES.invalidType };
    }

    const { previousPathname } = await replaceTripCoverImage(
      tripId,
      Buffer.from(bytes),
      validation.contentType,
    );

    if (previousPathname) {
      await cleanupTripCoverPathname(previousPathname);
    }

    revalidatePath(`/app/trips/${tripId}`);
    revalidateTripManagement(tripId, "details");
    return { ok: true, success: TRIP_COVER_MESSAGES.uploaded };
  } catch {
    return { error: TRIP_COVER_MESSAGES.generic };
  }
}

export async function removeTripCoverAction(
  _prev: TripCoverActionState,
  formData: FormData,
): Promise<TripCoverActionState> {
  const tripId = String(formData.get("tripId") ?? "");

  try {
    await requireTripOwner(tripId);
    await removeTripCoverImage(tripId);
    revalidatePath(`/app/trips/${tripId}`);
    revalidateTripManagement(tripId, "details");
    return { ok: true, success: TRIP_COVER_MESSAGES.removed };
  } catch {
    return { error: TRIP_COVER_MESSAGES.generic };
  }
}
