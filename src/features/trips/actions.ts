"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { createTripWithOwnerMembership } from "./create-trip";
import { TRIP_MESSAGES } from "./constants";
import { createTripSchema } from "./schemas";

export type TripFieldErrors = {
  name?: string;
  startDate?: string;
  endDate?: string;
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
    if (key === "name") {
      fieldErrors.name = TRIP_MESSAGES.name;
    } else if (key === "startDate") {
      fieldErrors.startDate = TRIP_MESSAGES.startDate;
    } else if (key === "endDate") {
      fieldErrors.endDate = issue.message.includes("before or equal")
        ? TRIP_MESSAGES.dateOrder
        : TRIP_MESSAGES.endDate;
    }
  }
  return fieldErrors;
}

export async function createTripAction(
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const user = await requireUser();

  const parsed = createTripSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error) };
  }

  let tripId: string;
  try {
    tripId = await createTripWithOwnerMembership(user.id, parsed.data);
  } catch {
    return { error: TRIP_MESSAGES.generic };
  }

  redirect(`/app/trips/${tripId}`);
}
