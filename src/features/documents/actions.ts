"use server";

import { revalidatePath } from "next/cache";
import { revalidateItineraryPaths } from "@/features/itinerary/revalidation";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";
import { requireTripOwner } from "@/features/trips/authorization";
import { TRAVEL_DOCUMENT_MESSAGES } from "./constants";
import {
  TravelDocumentNotFoundError,
  TravelDocumentValidationError,
  createTravelDocument,
  deleteTravelDocument,
  replaceTravelDocumentFile,
  updateTravelDocumentMetadata,
} from "./document-domain";
import {
  createTravelDocumentSchema,
  deleteTravelDocumentSchema,
  deriveTitleFromFilename,
  parseTravelDocumentMetadataFromFormData,
  replaceTravelDocumentFileSchema,
  updateTravelDocumentSchema,
} from "./schemas";
import { sanitizeOriginalFilename } from "./sanitize-filename";
import { resolveDocumentItineraryDates } from "./resolve-document-itinerary-dates";
import { validateTravelDocumentFile } from "./validate-travel-document-file";
import { getTravelDocumentForTrip } from "./queries";

export type TravelDocumentActionState = {
  ok?: boolean;
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

async function revalidateDocumentPaths(
  tripId: string,
  documentId?: string,
  itineraryDates: readonly string[] = [],
): Promise<void> {
  revalidatePath(`/app/trips/${tripId}/documents`);
  revalidateTripManagement(tripId, "documents");
  revalidateItineraryPaths(tripId, itineraryDates);
  revalidatePath(`/app/trips/${tripId}/emergency`);
  if (documentId) {
    revalidatePath(`/app/trips/${tripId}/documents/${documentId}`);
  }
}

function mapFileValidationError(
  error: "missing" | "tooLarge" | "invalidType",
): string {
  if (error === "tooLarge") {
    return TRAVEL_DOCUMENT_MESSAGES.tooLarge;
  }
  if (error === "missing") {
    return TRAVEL_DOCUMENT_MESSAGES.missingFile;
  }
  return TRAVEL_DOCUMENT_MESSAGES.invalidType;
}

async function readValidatedFile(file: FormDataEntryValue | null) {
  if (!(file instanceof File)) {
    return { error: TRAVEL_DOCUMENT_MESSAGES.missingFile } as const;
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const validation = validateTravelDocumentFile({
    size: file.size,
    bytes,
    declaredType: file.type,
  });

  if (!validation.ok) {
    return { error: mapFileValidationError(validation.error) } as const;
  }

  return {
    fileBytes: Buffer.from(bytes),
    contentType: validation.contentType,
    sizeBytes: file.size,
    originalFilename: sanitizeOriginalFilename(file.name),
  } as const;
}

export async function createTravelDocumentAction(
  _prev: TravelDocumentActionState,
  formData: FormData,
): Promise<TravelDocumentActionState> {
  const metadataInput = parseTravelDocumentMetadataFromFormData(formData);
  const parsed = createTravelDocumentSchema.safeParse({
    tripId: formData.get("tripId"),
    ...metadataInput,
  });

  if (!parsed.success) {
    return {
      error: TRAVEL_DOCUMENT_MESSAGES.generic,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  const fileResult = await readValidatedFile(formData.get("file"));
  if ("error" in fileResult) {
    return { error: fileResult.error };
  }

  const title =
    parsed.data.title?.trim() ||
    deriveTitleFromFilename(fileResult.originalFilename);

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    const documentId = await createTravelDocument({
      tripId: trip.id,
      metadata: {
        category: parsed.data.category,
        title,
        description: parsed.data.description,
        activityId: parsed.data.activityId,
        accommodationId: parsed.data.accommodationId,
        transportId: parsed.data.transportId,
        showInEmergency: parsed.data.showInEmergency,
      },
      fileBytes: fileResult.fileBytes,
      contentType: fileResult.contentType,
      sizeBytes: fileResult.sizeBytes,
      originalFilename: fileResult.originalFilename,
    });
    const itineraryDates = await resolveDocumentItineraryDates(trip.id, {
      activityId: parsed.data.activityId,
      accommodationId: parsed.data.accommodationId,
      transportId: parsed.data.transportId,
    });
    await revalidateDocumentPaths(trip.id, documentId, itineraryDates);
    return { ok: true, success: TRAVEL_DOCUMENT_MESSAGES.created };
  } catch (error) {
    if (error instanceof TravelDocumentValidationError) {
      return { error: error.message };
    }
    return { error: TRAVEL_DOCUMENT_MESSAGES.generic };
  }
}

export async function updateTravelDocumentAction(
  _prev: TravelDocumentActionState,
  formData: FormData,
): Promise<TravelDocumentActionState> {
  const parsed = updateTravelDocumentSchema.safeParse({
    tripId: formData.get("tripId"),
    documentId: formData.get("documentId"),
    ...parseTravelDocumentMetadataFromFormData(formData),
  });

  if (!parsed.success) {
    return {
      error: TRAVEL_DOCUMENT_MESSAGES.generic,
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      ),
    };
  }

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    const existing = await getTravelDocumentForTrip(trip.id, parsed.data.documentId);
    await updateTravelDocumentMetadata({
      tripId: trip.id,
      documentId: parsed.data.documentId,
      metadata: parsed.data,
    });
    const previousDates = existing?.contextLink
      ? await resolveDocumentItineraryDates(trip.id, {
          activityId:
            existing.contextLink.type === "activity"
              ? existing.contextLink.activityId
              : undefined,
          accommodationId:
            existing.contextLink.type === "accommodation"
              ? existing.contextLink.accommodationId
              : undefined,
          transportId:
            existing.contextLink.type === "transport"
              ? existing.contextLink.transportId
              : undefined,
        })
      : [];
    const nextDates = await resolveDocumentItineraryDates(trip.id, {
      activityId: parsed.data.activityId,
      accommodationId: parsed.data.accommodationId,
      transportId: parsed.data.transportId,
    });
    await revalidateDocumentPaths(trip.id, parsed.data.documentId, [
      ...previousDates,
      ...nextDates,
    ]);
    return { ok: true, success: TRAVEL_DOCUMENT_MESSAGES.updated };
  } catch (error) {
    if (error instanceof TravelDocumentValidationError) {
      return { error: error.message };
    }
    if (error instanceof TravelDocumentNotFoundError) {
      return { error: error.message };
    }
    return { error: TRAVEL_DOCUMENT_MESSAGES.generic };
  }
}

export async function replaceTravelDocumentFileAction(
  _prev: TravelDocumentActionState,
  formData: FormData,
): Promise<TravelDocumentActionState> {
  const parsed = replaceTravelDocumentFileSchema.safeParse({
    tripId: formData.get("tripId"),
    documentId: formData.get("documentId"),
  });

  if (!parsed.success) {
    return { error: TRAVEL_DOCUMENT_MESSAGES.generic };
  }

  const fileResult = await readValidatedFile(formData.get("file"));
  if ("error" in fileResult) {
    return { error: fileResult.error };
  }

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    await replaceTravelDocumentFile({
      tripId: trip.id,
      documentId: parsed.data.documentId,
      fileBytes: fileResult.fileBytes,
      contentType: fileResult.contentType,
      sizeBytes: fileResult.sizeBytes,
      originalFilename: fileResult.originalFilename,
    });
    const existing = await getTravelDocumentForTrip(trip.id, parsed.data.documentId);
    const itineraryDates = existing?.contextLink
      ? await resolveDocumentItineraryDates(trip.id, {
          activityId:
            existing.contextLink.type === "activity"
              ? existing.contextLink.activityId
              : undefined,
          accommodationId:
            existing.contextLink.type === "accommodation"
              ? existing.contextLink.accommodationId
              : undefined,
          transportId:
            existing.contextLink.type === "transport"
              ? existing.contextLink.transportId
              : undefined,
        })
      : [];
    await revalidateDocumentPaths(trip.id, parsed.data.documentId, itineraryDates);
    return { ok: true, success: TRAVEL_DOCUMENT_MESSAGES.replaced };
  } catch (error) {
    if (error instanceof TravelDocumentNotFoundError) {
      return { error: error.message };
    }
    return { error: TRAVEL_DOCUMENT_MESSAGES.generic };
  }
}

export async function deleteTravelDocumentAction(
  _prev: TravelDocumentActionState,
  formData: FormData,
): Promise<TravelDocumentActionState> {
  const parsed = deleteTravelDocumentSchema.safeParse({
    tripId: formData.get("tripId"),
    documentId: formData.get("documentId"),
  });

  if (!parsed.success) {
    return { error: TRAVEL_DOCUMENT_MESSAGES.generic };
  }

  try {
    const trip = await requireTripOwner(parsed.data.tripId);
    const existing = await getTravelDocumentForTrip(trip.id, parsed.data.documentId);
    await deleteTravelDocument({
      tripId: trip.id,
      documentId: parsed.data.documentId,
    });
    const itineraryDates = existing?.contextLink
      ? await resolveDocumentItineraryDates(trip.id, {
          activityId:
            existing.contextLink.type === "activity"
              ? existing.contextLink.activityId
              : undefined,
          accommodationId:
            existing.contextLink.type === "accommodation"
              ? existing.contextLink.accommodationId
              : undefined,
          transportId:
            existing.contextLink.type === "transport"
              ? existing.contextLink.transportId
              : undefined,
        })
      : [];
    await revalidateDocumentPaths(trip.id, parsed.data.documentId, itineraryDates);
    return { ok: true, success: TRAVEL_DOCUMENT_MESSAGES.deleted };
  } catch (error) {
    if (error instanceof TravelDocumentNotFoundError) {
      return { error: error.message };
    }
    return { error: TRAVEL_DOCUMENT_MESSAGES.generic };
  }
}
