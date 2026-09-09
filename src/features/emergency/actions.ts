"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { requireTripMember } from "@/features/trips/authorization";
import { buildEmergencyHref, EMERGENCY_MESSAGES } from "./constants";
import {
  createTripEmergencyResourceSchema,
  deleteTripEmergencyResourceSchema,
  updateTripEmergencyResourceSchema,
} from "./schemas";
import {
  TripEmergencyResourceNotFoundError,
  TripEmergencyResourceValidationError,
  createTripEmergencyResource,
  deleteTripEmergencyResource,
  updateTripEmergencyResource,
} from "./trip-emergency-resource-domain";

export type TripEmergencyResourceActionState = {
  ok?: boolean;
  error?: string;
  resourceId?: string;
};

function revalidateEmergencyPaths(tripId: string): void {
  revalidatePath(buildEmergencyHref(tripId));
  revalidatePath(`/app/trips/${tripId}/more`);
}

export async function createTripEmergencyResourceAction(
  _prev: TripEmergencyResourceActionState,
  formData: FormData,
): Promise<TripEmergencyResourceActionState> {
  const parsed = createTripEmergencyResourceSchema.safeParse({
    tripId: formData.get("tripId"),
    category: formData.get("category"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    secondaryPhone: formData.get("secondaryPhone"),
    email: formData.get("email"),
    address: formData.get("address"),
    url: formData.get("url"),
    reference: formData.get("reference"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: EMERGENCY_MESSAGES.validationFailed };
  }

  try {
    const user = await requireUser();
    await requireTripMember(parsed.data.tripId);
    const resourceId = await createTripEmergencyResource({
      tripId: parsed.data.tripId,
      userId: user.id,
      data: parsed.data,
    });
    revalidateEmergencyPaths(parsed.data.tripId);
    return { ok: true, resourceId };
  } catch (error) {
    if (error instanceof TripEmergencyResourceValidationError) {
      return { error: error.message };
    }
    return { error: EMERGENCY_MESSAGES.validationFailed };
  }
}

export async function updateTripEmergencyResourceAction(
  _prev: TripEmergencyResourceActionState,
  formData: FormData,
): Promise<TripEmergencyResourceActionState> {
  const parsed = updateTripEmergencyResourceSchema.safeParse({
    tripId: formData.get("tripId"),
    resourceId: formData.get("resourceId"),
    category: formData.get("category"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    secondaryPhone: formData.get("secondaryPhone"),
    email: formData.get("email"),
    address: formData.get("address"),
    url: formData.get("url"),
    reference: formData.get("reference"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: EMERGENCY_MESSAGES.validationFailed };
  }

  try {
    await requireUser();
    await requireTripMember(parsed.data.tripId);
    await updateTripEmergencyResource({
      tripId: parsed.data.tripId,
      resourceId: parsed.data.resourceId,
      data: parsed.data,
    });
    revalidateEmergencyPaths(parsed.data.tripId);
    return { ok: true, resourceId: parsed.data.resourceId };
  } catch (error) {
    if (error instanceof TripEmergencyResourceNotFoundError) {
      return { error: error.message };
    }
    if (error instanceof TripEmergencyResourceValidationError) {
      return { error: error.message };
    }
    return { error: EMERGENCY_MESSAGES.validationFailed };
  }
}

export async function deleteTripEmergencyResourceAction(
  _prev: TripEmergencyResourceActionState,
  formData: FormData,
): Promise<TripEmergencyResourceActionState> {
  const parsed = deleteTripEmergencyResourceSchema.safeParse({
    tripId: formData.get("tripId"),
    resourceId: formData.get("resourceId"),
  });

  if (!parsed.success) {
    return { error: EMERGENCY_MESSAGES.validationFailed };
  }

  try {
    await requireUser();
    await requireTripMember(parsed.data.tripId);
    await deleteTripEmergencyResource(parsed.data);
    revalidateEmergencyPaths(parsed.data.tripId);
    return { ok: true, resourceId: parsed.data.resourceId };
  } catch (error) {
    if (error instanceof TripEmergencyResourceNotFoundError) {
      return { error: error.message };
    }
    return { error: EMERGENCY_MESSAGES.validationFailed };
  }
}
