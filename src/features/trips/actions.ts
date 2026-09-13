"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { createTripWithOwnerMembership } from "./create-trip";
import { TRIP_ERROR_CODES } from "./constants";
import { createTripWizardSchema } from "./schemas";

export type TripFieldErrors = {
  name?: string;
  startDate?: string;
  endDate?: string;
  googlePlaceId?: string;
};

export type TripActionState = {
  error?: string;
  fieldErrors?: TripFieldErrors;
};

function zodFieldErrors(error: {
  issues: readonly { path: readonly PropertyKey[]; message: string }[];
}): TripFieldErrors {
  const fieldErrors: TripFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (
      key === "name" ||
      key === "startDate" ||
      key === "endDate" ||
      key === "googlePlaceId"
    ) {
      if (key === "name") {
        fieldErrors.name = TRIP_ERROR_CODES.name;
      } else if (key === "startDate") {
        fieldErrors.startDate = TRIP_ERROR_CODES.startDate;
      } else if (key === "endDate") {
        fieldErrors.endDate = issue.message.includes("before or equal")
          ? TRIP_ERROR_CODES.dateOrder
          : issue.message.includes("maximum")
            ? TRIP_ERROR_CODES.maxDuration
            : TRIP_ERROR_CODES.endDate;
      } else if (key === "googlePlaceId") {
        fieldErrors.googlePlaceId = "Please select a valid destination";
      }
    }
  }
  return fieldErrors;
}

export async function createTripWizardAction(input: {
  googlePlaceId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
}): Promise<TripActionState> {
  const user = await requireUser();

  const parsed = createTripWizardSchema.safeParse(input);
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error) };
  }

  let tripId: string;
  try {
    tripId = await createTripWithOwnerMembership(user.id, parsed.data);
  } catch {
    return { error: TRIP_ERROR_CODES.generic };
  }

  redirect(`/app/trips/${tripId}`);
}
