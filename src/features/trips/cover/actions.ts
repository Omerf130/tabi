"use server";

import { revalidatePath } from "next/cache";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";
import { requireTripOwner } from "@/features/trips/authorization";
import {
  cleanupTripCoverPathname,
  removeTripCoverImage,
  replaceTripCoverImage,
} from "./cover-domain";
import {
  TRIP_COVER_ERROR_CODES,
  TRIP_COVER_SUCCESS_CODES,
} from "./constants";
import { validateTripCoverUpload } from "./validate-trip-cover";
import type { TripCoverErrorCode, TripCoverSuccessCode } from "./constants";

export type TripCoverActionState = {
  ok?: boolean;
  errorCode?: TripCoverErrorCode;
  successCode?: TripCoverSuccessCode;
};

export async function uploadTripCoverAction(
  _prev: TripCoverActionState,
  formData: FormData,
): Promise<TripCoverActionState> {
  const tripId = String(formData.get("tripId") ?? "");
  const file = formData.get("cover");

  if (!(file instanceof File)) {
    return { errorCode: TRIP_COVER_ERROR_CODES.missingFile };
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
        return { errorCode: TRIP_COVER_ERROR_CODES.tooLarge };
      }
      if (validation.error === "missing") {
        return { errorCode: TRIP_COVER_ERROR_CODES.missingFile };
      }
      return { errorCode: TRIP_COVER_ERROR_CODES.invalidType };
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
    return { ok: true, successCode: TRIP_COVER_SUCCESS_CODES.uploaded };
  } catch {
    return { errorCode: TRIP_COVER_ERROR_CODES.generic };
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
    return { ok: true, successCode: TRIP_COVER_SUCCESS_CODES.removed };
  } catch {
    return { errorCode: TRIP_COVER_ERROR_CODES.generic };
  }
}
