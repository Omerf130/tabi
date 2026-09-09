"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { requireTripMember } from "@/features/trips/authorization";
import { TRIP_LIST_DEFINITIONS, TRIP_LIST_MESSAGES } from "./constants";
import {
  createTripListItem,
  deleteTripListItem,
  setTripListItemCompleted,
  TripListItemNotFoundError,
  TripListItemValidationError,
  updateTripListItemText,
} from "./list-domain";
import {
  createTripListItemSchema,
  deleteTripListItemSchema,
  setTripListItemCompletedSchema,
  updateTripListItemSchema,
} from "./schemas";

export type TripListActionState = {
  ok?: boolean;
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

function revalidateTripListPaths(tripId: string): void {
  revalidatePath(`/app/trips/${tripId}/lists`);
  for (const definition of TRIP_LIST_DEFINITIONS) {
    revalidatePath(`/app/trips/${tripId}/lists/${definition.slug}`);
  }
}

export async function createTripListItemAction(
  _prev: TripListActionState,
  formData: FormData,
): Promise<TripListActionState> {
  const parsed = createTripListItemSchema.safeParse({
    tripId: formData.get("tripId"),
    listType: formData.get("listType"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return {
      error: TRIP_LIST_MESSAGES.generic,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    const user = await requireUser();
    const trip = await requireTripMember(parsed.data.tripId);
    await createTripListItem({
      tripId: trip.id,
      listType: parsed.data.listType,
      text: parsed.data.text,
      userId: user.id,
    });
    revalidateTripListPaths(trip.id);
    return { ok: true, success: TRIP_LIST_MESSAGES.created };
  } catch (error) {
    if (error instanceof TripListItemValidationError) {
      return { error: error.message };
    }
    return { error: TRIP_LIST_MESSAGES.generic };
  }
}

export async function updateTripListItemAction(
  _prev: TripListActionState,
  formData: FormData,
): Promise<TripListActionState> {
  const parsed = updateTripListItemSchema.safeParse({
    tripId: formData.get("tripId"),
    itemId: formData.get("itemId"),
    text: formData.get("text"),
  });

  if (!parsed.success) {
    return {
      error: TRIP_LIST_MESSAGES.generic,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    await requireTripMember(parsed.data.tripId);
    await updateTripListItemText({
      tripId: parsed.data.tripId,
      itemId: parsed.data.itemId,
      text: parsed.data.text,
    });
    revalidateTripListPaths(parsed.data.tripId);
    return { ok: true, success: TRIP_LIST_MESSAGES.updated };
  } catch (error) {
    if (error instanceof TripListItemNotFoundError) {
      return { error: error.message };
    }
    return { error: TRIP_LIST_MESSAGES.generic };
  }
}

export async function setTripListItemCompletedAction(
  _prev: TripListActionState,
  formData: FormData,
): Promise<TripListActionState> {
  const parsed = setTripListItemCompletedSchema.safeParse({
    tripId: formData.get("tripId"),
    itemId: formData.get("itemId"),
    isCompleted: formData.get("isCompleted"),
  });

  if (!parsed.success) {
    return { error: TRIP_LIST_MESSAGES.generic };
  }

  try {
    const user = await requireUser();
    await requireTripMember(parsed.data.tripId);
    await setTripListItemCompleted({
      tripId: parsed.data.tripId,
      itemId: parsed.data.itemId,
      isCompleted: parsed.data.isCompleted,
      userId: user.id,
    });
    revalidateTripListPaths(parsed.data.tripId);
    return {
      ok: true,
      success: parsed.data.isCompleted
        ? TRIP_LIST_MESSAGES.completed
        : TRIP_LIST_MESSAGES.uncompleted,
    };
  } catch (error) {
    if (error instanceof TripListItemNotFoundError) {
      return { error: error.message };
    }
    return { error: TRIP_LIST_MESSAGES.generic };
  }
}

export async function deleteTripListItemAction(
  _prev: TripListActionState,
  formData: FormData,
): Promise<TripListActionState> {
  const parsed = deleteTripListItemSchema.safeParse({
    tripId: formData.get("tripId"),
    itemId: formData.get("itemId"),
  });

  if (!parsed.success) {
    return { error: TRIP_LIST_MESSAGES.generic };
  }

  try {
    await requireTripMember(parsed.data.tripId);
    await deleteTripListItem({
      tripId: parsed.data.tripId,
      itemId: parsed.data.itemId,
    });
    revalidateTripListPaths(parsed.data.tripId);
    return { ok: true, success: TRIP_LIST_MESSAGES.deleted };
  } catch (error) {
    if (error instanceof TripListItemNotFoundError) {
      return { error: error.message };
    }
    return { error: TRIP_LIST_MESSAGES.generic };
  }
}
