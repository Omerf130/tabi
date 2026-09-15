"use server";

import { TRIP_ERROR_CODES } from "@/features/trips/constants";
import {
  updateTripDestination,
  updateTripIdentity,
} from "@/features/trips/update-trip-details";
import {
  updateTripDestinationSchema,
  updateTripIdentitySchema,
} from "@/features/trips/schemas";

export type TripDetailsFieldErrors = {
  name?: string;
  description?: string;
  googlePlaceId?: string;
};

export type TripDetailsActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: TripDetailsFieldErrors;
};

function mapIdentityFieldErrors(error: {
  issues: readonly { path: readonly PropertyKey[]; message: string }[];
}): TripDetailsFieldErrors {
  const fieldErrors: TripDetailsFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "name") {
      fieldErrors.name = TRIP_ERROR_CODES.name;
    } else if (key === "description") {
      fieldErrors.description = "description";
    }
  }
  return fieldErrors;
}

export async function updateTripIdentityAction(
  _prev: TripDetailsActionState,
  formData: FormData,
): Promise<TripDetailsActionState> {
  const parsed = updateTripIdentitySchema.safeParse({
    tripId: formData.get("tripId"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: mapIdentityFieldErrors(parsed.error) };
  }

  try {
    await updateTripIdentity(parsed.data);
    return { ok: true };
  } catch {
    return { error: TRIP_ERROR_CODES.generic };
  }
}

export async function updateTripDestinationAction(
  _prev: TripDetailsActionState,
  formData: FormData,
): Promise<TripDetailsActionState> {
  const parsed = updateTripDestinationSchema.safeParse({
    tripId: formData.get("tripId"),
    googlePlaceId: formData.get("googlePlaceId"),
  });

  if (!parsed.success) {
    const fieldErrors: TripDetailsFieldErrors = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "googlePlaceId") {
        fieldErrors.googlePlaceId = "invalidDestination";
      }
    }
    return { fieldErrors };
  }

  try {
    await updateTripDestination(parsed.data);
    return { ok: true };
  } catch {
    return { error: TRIP_ERROR_CODES.generic };
  }
}
