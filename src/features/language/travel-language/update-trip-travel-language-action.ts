"use server";

import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { requireTripOwner } from "@/features/trips/authorization";
import { normalizeSelectableTravelLanguageCode } from "../translation/azure-supported-travel-languages";
import { revalidateTripTravelLanguageSurfaces } from "./revalidate-trip-travel-language";
import { updateTripTravelLanguageSchema } from "./update-trip-travel-language-schema";

export const TRIP_TRAVEL_LANGUAGE_ERROR_CODES = {
  validationFailed: "validationFailed",
  forbidden: "forbidden",
  generic: "generic",
} as const;

export type TripTravelLanguageErrorCode =
  (typeof TRIP_TRAVEL_LANGUAGE_ERROR_CODES)[keyof typeof TRIP_TRAVEL_LANGUAGE_ERROR_CODES];

export type UpdateTripTravelLanguageActionState = {
  ok?: boolean;
  errorCode?: TripTravelLanguageErrorCode;
};

export async function updateTripTravelLanguageAction(
  _prev: UpdateTripTravelLanguageActionState,
  formData: FormData,
): Promise<UpdateTripTravelLanguageActionState> {
  const parsed = updateTripTravelLanguageSchema.safeParse({
    tripId: formData.get("tripId"),
    selectionMode: formData.get("selectionMode"),
    travelLanguageCode: formData.get("travelLanguageCode") ?? undefined,
  });

  if (!parsed.success) {
    return { errorCode: TRIP_TRAVEL_LANGUAGE_ERROR_CODES.validationFailed };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await connectDb();

    const nextTravelLanguageCode =
      parsed.data.selectionMode === "automatic"
        ? null
        : normalizeSelectableTravelLanguageCode(parsed.data.travelLanguageCode);

    if (parsed.data.selectionMode === "manual" && !nextTravelLanguageCode) {
      return { errorCode: TRIP_TRAVEL_LANGUAGE_ERROR_CODES.validationFailed };
    }

    const updated = await Trip.findByIdAndUpdate(
      parsed.data.tripId,
      { $set: { travelLanguageCode: nextTravelLanguageCode } },
      { runValidators: true },
    );

    if (!updated) {
      return { errorCode: TRIP_TRAVEL_LANGUAGE_ERROR_CODES.generic };
    }

    revalidateTripTravelLanguageSurfaces(parsed.data.tripId);
    return { ok: true };
  } catch {
    return { errorCode: TRIP_TRAVEL_LANGUAGE_ERROR_CODES.forbidden };
  }
}
