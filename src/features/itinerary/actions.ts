"use server";

import { requireUser } from "@/features/auth/session";
import { requireTripOwner } from "@/features/trips/authorization";
import { createActivity } from "./create-activity";
import { deleteActivity } from "./delete-activity";
import { ACTIVITY_MESSAGES } from "./constants";
import {
  ActivityDateOutOfRangeError,
  ActivityNotFoundError,
} from "./errors";
import { getActivityForTrip } from "./queries";
import { reorderActivity } from "./reorder-activity";
import {
  createActivitySchema,
  deleteActivitySchema,
  parseActivityFieldsFromFormData,
  reorderActivitySchema,
  updateActivitySchema,
} from "./schemas";
import { updateActivity } from "./update-activity";
import { revalidateItineraryPaths } from "./revalidation";

export type ActivityFieldErrors = {
  title?: string;
  type?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  address?: string;
  notes?: string;
};

export type ActivityActionState = {
  ok?: boolean;
  date?: string;
  previousDate?: string;
  activityId?: string;
  error?: string;
  fieldErrors?: ActivityFieldErrors;
};

function mapActivityFieldErrors(error: {
  issues: readonly { path: readonly PropertyKey[] }[];
}): ActivityFieldErrors {
  const fieldErrors: ActivityFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "title") fieldErrors.title = ACTIVITY_MESSAGES.generic;
    if (key === "type") fieldErrors.type = ACTIVITY_MESSAGES.generic;
    if (key === "date") fieldErrors.date = ACTIVITY_MESSAGES.dateOutOfRange;
    if (key === "startTime") fieldErrors.startTime = ACTIVITY_MESSAGES.generic;
    if (key === "endTime") fieldErrors.endTime = ACTIVITY_MESSAGES.generic;
    if (key === "locationName") fieldErrors.locationName = ACTIVITY_MESSAGES.generic;
    if (key === "address") fieldErrors.address = ACTIVITY_MESSAGES.generic;
    if (key === "notes") fieldErrors.notes = ACTIVITY_MESSAGES.generic;
  }
  return fieldErrors;
}


export async function createActivityAction(
  _prev: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  await requireUser();

  const parsed = createActivitySchema.safeParse({
    tripId: formData.get("tripId"),
    ...parseActivityFieldsFromFormData(formData),
  });

  if (!parsed.success) {
    return { fieldErrors: mapActivityFieldErrors(parsed.error) };
  }

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    const activityId = await createActivity(trip, parsed.data);
    revalidateItineraryPaths(trip.id, [parsed.data.date]);
    return {
      ok: true,
      date: parsed.data.date,
      activityId,
    };
  } catch (error) {
    if (error instanceof ActivityDateOutOfRangeError) {
      return { fieldErrors: { date: ACTIVITY_MESSAGES.dateOutOfRange } };
    }
    return { error: ACTIVITY_MESSAGES.generic };
  }
}

export async function updateActivityAction(
  _prev: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  await requireUser();

  const parsed = updateActivitySchema.safeParse({
    tripId: formData.get("tripId"),
    activityId: formData.get("activityId"),
    ...parseActivityFieldsFromFormData(formData),
  });

  if (!parsed.success) {
    return { fieldErrors: mapActivityFieldErrors(parsed.error) };
  }

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    const existing = await getActivityForTrip(trip.id, parsed.data.activityId);
    if (!existing) {
      return { error: ACTIVITY_MESSAGES.notFound };
    }

    const previousDate = existing.date;
    const date = await updateActivity(trip, parsed.data);
    revalidateItineraryPaths(
      trip.id,
      previousDate !== date ? [date, previousDate] : [date],
    );
    return {
      ok: true,
      date,
      previousDate: previousDate !== date ? previousDate : undefined,
      activityId: parsed.data.activityId,
    };
  } catch (error) {
    if (error instanceof ActivityNotFoundError) {
      return { error: ACTIVITY_MESSAGES.notFound };
    }
    if (error instanceof ActivityDateOutOfRangeError) {
      return { fieldErrors: { date: ACTIVITY_MESSAGES.dateOutOfRange } };
    }
    return { error: ACTIVITY_MESSAGES.generic };
  }
}

export async function deleteActivityAction(
  _prev: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  await requireUser();

  const parsed = deleteActivitySchema.safeParse({
    tripId: formData.get("tripId"),
    activityId: formData.get("activityId"),
  });

  if (!parsed.success) {
    return { error: ACTIVITY_MESSAGES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    const date = await deleteActivity(parsed.data);
    revalidateItineraryPaths(parsed.data.tripId, [date]);
    return { ok: true, date, activityId: parsed.data.activityId };
  } catch (error) {
    if (error instanceof ActivityNotFoundError) {
      return { error: ACTIVITY_MESSAGES.notFound };
    }
    return { error: ACTIVITY_MESSAGES.generic };
  }
}

export async function reorderActivityAction(
  _prev: ActivityActionState,
  formData: FormData,
): Promise<ActivityActionState> {
  await requireUser();

  const parsed = reorderActivitySchema.safeParse({
    tripId: formData.get("tripId"),
    activityId: formData.get("activityId"),
    direction: formData.get("direction"),
  });

  if (!parsed.success) {
    return { error: ACTIVITY_MESSAGES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    const existing = await getActivityForTrip(
      parsed.data.tripId,
      parsed.data.activityId,
    );
    await reorderActivity(parsed.data);
    revalidateItineraryPaths(
      parsed.data.tripId,
      existing ? [existing.date] : [],
    );
    return {
      ok: true,
      activityId: parsed.data.activityId,
      date: existing?.date,
    };
  } catch (error) {
    if (error instanceof ActivityNotFoundError) {
      return { error: ACTIVITY_MESSAGES.notFound };
    }
    return { error: ACTIVITY_MESSAGES.generic };
  }
}
