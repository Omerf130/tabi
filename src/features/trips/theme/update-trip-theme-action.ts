"use server";

import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { requireTripOwner } from "@/features/trips/authorization";
import { isTripThemeSelectable } from "./trip-theme-registry";
import { revalidateTripThemeSurfaces } from "./revalidate-trip-theme";
import {
  TRIP_THEME_ERROR_CODES,
  type UpdateTripThemeActionState,
} from "./update-trip-theme-action-state";
import { updateTripThemeSchema } from "./update-trip-theme-schema";

export async function updateTripThemeAction(
  _prev: UpdateTripThemeActionState,
  formData: FormData,
): Promise<UpdateTripThemeActionState> {
  const parsed = updateTripThemeSchema.safeParse({
    tripId: formData.get("tripId"),
    themeKey: formData.get("themeKey"),
  });

  if (!parsed.success) {
    return { errorCode: TRIP_THEME_ERROR_CODES.validationFailed };
  }

  if (!isTripThemeSelectable(parsed.data.themeKey)) {
    return { errorCode: TRIP_THEME_ERROR_CODES.themeUnavailable };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await connectDb();

    const updated = await Trip.findByIdAndUpdate(
      parsed.data.tripId,
      { $set: { themeKey: parsed.data.themeKey } },
      { runValidators: true },
    );

    if (!updated) {
      return { errorCode: TRIP_THEME_ERROR_CODES.notFound };
    }

    revalidateTripThemeSurfaces(parsed.data.tripId);
    return { ok: true };
  } catch {
    return { errorCode: TRIP_THEME_ERROR_CODES.generic };
  }
}
