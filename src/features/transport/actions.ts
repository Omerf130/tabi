"use server";

import { revalidatePath } from "next/cache";
import { revalidateItineraryPaths } from "@/features/itinerary/revalidation";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";
import { requireTripOwner } from "@/features/trips/authorization";
import { getTransportForTrip } from "./queries";
import { TRANSPORT_MESSAGES } from "./constants";
import {
  createTransportSchema,
  deleteTransportSchema,
  parseTransportFromFormData,
  updateTransportSchema,
} from "./schemas";
import {
  TransportNotFoundError,
  TransportValidationError,
  createTransport,
  deleteTransport,
  updateTransport,
} from "./transport-domain";

export type TransportActionState = {
  ok?: boolean;
  error?: string;
  success?: string;
  transportId?: string;
  fieldErrors?: Record<string, string>;
};

function revalidateTransportPaths(
  tripId: string,
  transportId?: string,
  departureDates: readonly string[] = [],
): void {
  revalidatePath(`/app/trips/${tripId}/transport`);
  revalidateTripManagement(tripId, "transport");
  revalidateItineraryPaths(tripId, departureDates);
  revalidatePath(`/app/trips/${tripId}/more`);
  revalidatePath(`/app/trips/${tripId}/documents`);
  revalidatePath(`/app/trips/${tripId}`);
  if (transportId) {
    revalidatePath(`/app/trips/${tripId}/transport/${transportId}`);
    revalidatePath(`/app/trips/${tripId}/transport/${transportId}/edit`);
  }
}

export async function createTransportAction(
  _prev: TransportActionState,
  formData: FormData,
): Promise<TransportActionState> {
  const parsed = createTransportSchema.safeParse(parseTransportFromFormData(formData));

  if (!parsed.success) {
    return {
      error: TRANSPORT_MESSAGES.saveFailed,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    const trip = await requireTripOwner(String(formData.get("tripId")));
    const transportId = await createTransport(trip.id, parsed.data);
    revalidateTransportPaths(trip.id, transportId, [parsed.data.departure.date]);
    return { ok: true, success: "נשמר", transportId };
  } catch (error) {
    if (error instanceof TransportValidationError) {
      return { error: error.message };
    }
    return { error: TRANSPORT_MESSAGES.saveFailed };
  }
}

export async function updateTransportAction(
  _prev: TransportActionState,
  formData: FormData,
): Promise<TransportActionState> {
  const parsed = updateTransportSchema.safeParse(parseTransportFromFormData(formData));

  if (!parsed.success) {
    return {
      error: TRANSPORT_MESSAGES.saveFailed,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    const trip = await requireTripOwner(String(formData.get("tripId")));
    const existing = await getTransportForTrip(trip.id, parsed.data.transportId);
    await updateTransport(trip.id, parsed.data);
    const dates = [
      parsed.data.departure.date,
      existing?.departure.date,
    ].filter((value): value is string => Boolean(value));
    revalidateTransportPaths(trip.id, parsed.data.transportId, dates);
    return { ok: true, success: "עודכן" };
  } catch (error) {
    if (error instanceof TransportValidationError) {
      return { error: error.message };
    }
    if (error instanceof TransportNotFoundError) {
      return { error: error.message };
    }
    return { error: TRANSPORT_MESSAGES.saveFailed };
  }
}

export async function deleteTransportAction(
  _prev: TransportActionState,
  formData: FormData,
): Promise<TransportActionState> {
  const parsed = deleteTransportSchema.safeParse({
    tripId: formData.get("tripId"),
    transportId: formData.get("transportId"),
  });

  if (!parsed.success) {
    return { error: TRANSPORT_MESSAGES.deleteFailed };
  }

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    const existing = await getTransportForTrip(trip.id, parsed.data.transportId);
    await deleteTransport(trip.id, parsed.data.transportId);
    revalidateTransportPaths(
      trip.id,
      parsed.data.transportId,
      existing ? [existing.departure.date] : [],
    );
    return { ok: true, success: "נמחק" };
  } catch (error) {
    if (error instanceof TransportNotFoundError) {
      return { error: error.message };
    }
    return { error: TRANSPORT_MESSAGES.deleteFailed };
  }
}
