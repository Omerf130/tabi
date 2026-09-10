"use server";

import { revalidatePath } from "next/cache";
import { revalidateItineraryPaths } from "@/features/itinerary/revalidation";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";
import { requireTripOwner } from "@/features/trips/authorization";
import { ACCOMMODATION_MESSAGES } from "./constants";
import {
  AccommodationNotFoundError,
  AccommodationValidationError,
  createAccommodation,
  deleteAccommodation,
  updateAccommodation,
} from "./accommodation-domain";
import {
  accommodationMutationSchema,
  createAccommodationSchema,
  parseAccommodationFieldsFromFormData,
  updateAccommodationSchema,
} from "./schemas";

export type AccommodationActionState = {
  ok?: boolean;
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

function revalidateAccommodationPaths(tripId: string): void {
  revalidatePath(`/app/trips/${tripId}/accommodations`);
  revalidateTripManagement(tripId, "accommodations");
  revalidateItineraryPaths(tripId);
  revalidatePath(`/app/trips/${tripId}/more`);
}

export async function createAccommodationAction(
  _prev: AccommodationActionState,
  formData: FormData,
): Promise<AccommodationActionState> {
  const parsed = createAccommodationSchema.safeParse(
    parseAccommodationFieldsFromFormData(formData),
  );

  if (!parsed.success) {
    return {
      error: ACCOMMODATION_MESSAGES.generic,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    await createAccommodation({
      tripId: trip.id,
      startDate: trip.startDate,
      endDate: trip.endDate,
      fields: parsed.data,
    });
    revalidateAccommodationPaths(trip.id);
    return { ok: true, success: ACCOMMODATION_MESSAGES.created };
  } catch (error) {
    if (error instanceof AccommodationValidationError) {
      return { error: error.message };
    }
    return { error: ACCOMMODATION_MESSAGES.generic };
  }
}

export async function updateAccommodationAction(
  _prev: AccommodationActionState,
  formData: FormData,
): Promise<AccommodationActionState> {
  const parsed = updateAccommodationSchema.safeParse({
    ...parseAccommodationFieldsFromFormData(formData),
    accommodationId: formData.get("accommodationId"),
  });

  if (!parsed.success) {
    return {
      error: ACCOMMODATION_MESSAGES.generic,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    await updateAccommodation({
      tripId: trip.id,
      accommodationId: parsed.data.accommodationId,
      startDate: trip.startDate,
      endDate: trip.endDate,
      fields: parsed.data,
    });
    revalidateAccommodationPaths(trip.id);
    revalidatePath(
      `/app/trips/${trip.id}/accommodations/${parsed.data.accommodationId}`,
    );
    return { ok: true, success: ACCOMMODATION_MESSAGES.updated };
  } catch (error) {
    if (error instanceof AccommodationValidationError) {
      return { error: error.message };
    }
    if (error instanceof AccommodationNotFoundError) {
      return { error: error.message };
    }
    return { error: ACCOMMODATION_MESSAGES.generic };
  }
}

export async function deleteAccommodationAction(
  _prev: AccommodationActionState,
  formData: FormData,
): Promise<AccommodationActionState> {
  const parsed = accommodationMutationSchema.safeParse({
    tripId: formData.get("tripId"),
    accommodationId: formData.get("accommodationId"),
  });

  if (!parsed.success) {
    return { error: ACCOMMODATION_MESSAGES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await deleteAccommodation({
      tripId: parsed.data.tripId,
      accommodationId: parsed.data.accommodationId,
    });
    revalidateAccommodationPaths(parsed.data.tripId);
    revalidatePath(
      `/app/trips/${parsed.data.tripId}/accommodations/${parsed.data.accommodationId}`,
    );
    return { ok: true, success: ACCOMMODATION_MESSAGES.deleted };
  } catch (error) {
    if (error instanceof AccommodationNotFoundError) {
      return { error: error.message };
    }
    return { error: ACCOMMODATION_MESSAGES.generic };
  }
}
