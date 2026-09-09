import "server-only";

import mongoose from "mongoose";
import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { Accommodation } from "@/models/Accommodation";
import { Transport } from "@/models/Transport";
import { TravelDocument } from "@/models/TravelDocument";
import {
  deleteTravelDocumentBlob,
  uploadTravelDocumentBlob,
} from "./blob-storage";
import { TRAVEL_DOCUMENT_MESSAGES } from "./constants";
import { sanitizeOriginalFilename } from "./sanitize-filename";
import type { TravelDocumentMetadataInput } from "./schemas";

export class TravelDocumentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TravelDocumentValidationError";
  }
}

export class TravelDocumentNotFoundError extends Error {
  constructor() {
    super(TRAVEL_DOCUMENT_MESSAGES.notFound);
    this.name = "TravelDocumentNotFoundError";
  }
}

function toOptionalObjectId(value?: string): mongoose.Types.ObjectId | null {
  return value ? new mongoose.Types.ObjectId(value) : null;
}

function toLinkFields(metadata: TravelDocumentMetadataInput) {
  return {
    activityId: toOptionalObjectId(metadata.activityId),
    accommodationId: toOptionalObjectId(metadata.accommodationId),
    transportId: toOptionalObjectId(metadata.transportId),
  };
}

function countContextLinks(metadata: TravelDocumentMetadataInput): number {
  return [metadata.activityId, metadata.accommodationId, metadata.transportId].filter(
    Boolean,
  ).length;
}

async function assertActivityBelongsToTrip(
  tripId: string,
  activityId: string,
): Promise<void> {
  await connectDb();
  const activity = await Activity.findOne({ _id: activityId, tripId }).lean();
  if (!activity) {
    throw new TravelDocumentValidationError(TRAVEL_DOCUMENT_MESSAGES.invalidLink);
  }
}

async function assertAccommodationBelongsToTrip(
  tripId: string,
  accommodationId: string,
): Promise<void> {
  await connectDb();
  const accommodation = await Accommodation.findOne({
    _id: accommodationId,
    tripId,
  }).lean();
  if (!accommodation) {
    throw new TravelDocumentValidationError(TRAVEL_DOCUMENT_MESSAGES.invalidLink);
  }
}

async function assertTransportBelongsToTrip(
  tripId: string,
  transportId: string,
): Promise<void> {
  await connectDb();
  const transport = await Transport.findOne({ _id: transportId, tripId }).lean();
  if (!transport) {
    throw new TravelDocumentValidationError(TRAVEL_DOCUMENT_MESSAGES.invalidLink);
  }
}

async function validateContextLinks(
  tripId: string,
  metadata: TravelDocumentMetadataInput,
): Promise<void> {
  if (countContextLinks(metadata) > 1) {
    throw new TravelDocumentValidationError(TRAVEL_DOCUMENT_MESSAGES.bothLinks);
  }

  if (metadata.activityId) {
    await assertActivityBelongsToTrip(tripId, metadata.activityId);
  }

  if (metadata.accommodationId) {
    await assertAccommodationBelongsToTrip(tripId, metadata.accommodationId);
  }

  if (metadata.transportId) {
    await assertTransportBelongsToTrip(tripId, metadata.transportId);
  }
}

export async function createTravelDocument(input: {
  tripId: string;
  metadata: TravelDocumentMetadataInput;
  fileBytes: Buffer;
  contentType: string;
  sizeBytes: number;
  originalFilename?: string;
}): Promise<string> {
  await validateContextLinks(input.tripId, input.metadata);

  const documentId = new mongoose.Types.ObjectId();
  let uploadedPathname: string | null = null;

  try {
    const storedBlob = await uploadTravelDocumentBlob(
      input.tripId,
      documentId.toString(),
      input.fileBytes,
      input.contentType,
    );
    uploadedPathname = storedBlob.pathname;

    await connectDb();
    const created = await TravelDocument.create({
      _id: documentId,
      tripId: input.tripId,
      category: input.metadata.category,
      title: input.metadata.title,
      description: input.metadata.description ?? null,
      showInEmergency: input.metadata.showInEmergency ?? false,
      file: {
        pathname: storedBlob.pathname,
        contentType: storedBlob.contentType,
        sizeBytes: input.sizeBytes,
        originalFilename: input.originalFilename
          ? sanitizeOriginalFilename(input.originalFilename)
          : null,
      },
      ...toLinkFields(input.metadata),
    });

    return created._id.toString();
  } catch (error) {
    if (uploadedPathname) {
      try {
        await deleteTravelDocumentBlob(uploadedPathname);
      } catch {
        console.error("Failed to roll back uploaded travel document blob");
      }
    }
    throw error;
  }
}

export async function updateTravelDocumentMetadata(input: {
  tripId: string;
  documentId: string;
  metadata: TravelDocumentMetadataInput;
}): Promise<void> {
  await validateContextLinks(input.tripId, input.metadata);

  await connectDb();
  const updated = await TravelDocument.findOneAndUpdate(
    { _id: input.documentId, tripId: input.tripId },
    {
      category: input.metadata.category,
      title: input.metadata.title,
      description: input.metadata.description ?? null,
      showInEmergency: input.metadata.showInEmergency ?? false,
      ...toLinkFields(input.metadata),
    },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw new TravelDocumentNotFoundError();
  }
}

export async function replaceTravelDocumentFile(input: {
  tripId: string;
  documentId: string;
  fileBytes: Buffer;
  contentType: string;
  sizeBytes: number;
  originalFilename?: string;
}): Promise<void> {
  await connectDb();
  const existing = await TravelDocument.findOne({
    _id: input.documentId,
    tripId: input.tripId,
  }).lean();

  if (!existing) {
    throw new TravelDocumentNotFoundError();
  }

  if (!existing.file?.pathname) {
    throw new TravelDocumentNotFoundError();
  }

  const existingFile = existing.file;
  const previousPathname = existingFile.pathname;
  let uploadedPathname: string | null = null;

  try {
    const storedBlob = await uploadTravelDocumentBlob(
      input.tripId,
      input.documentId,
      input.fileBytes,
      input.contentType,
    );
    uploadedPathname = storedBlob.pathname;

    const updated = await TravelDocument.findOneAndUpdate(
      { _id: input.documentId, tripId: input.tripId },
      {
        file: {
          pathname: storedBlob.pathname,
          contentType: storedBlob.contentType,
          sizeBytes: input.sizeBytes,
          originalFilename: input.originalFilename
            ? sanitizeOriginalFilename(input.originalFilename)
            : existingFile.originalFilename ?? null,
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      throw new TravelDocumentNotFoundError();
    }
  } catch (error) {
    if (uploadedPathname) {
      try {
        await deleteTravelDocumentBlob(uploadedPathname);
      } catch {
        console.error("Failed to roll back replacement travel document blob");
      }
    }
    throw error;
  }

  if (previousPathname && previousPathname !== uploadedPathname) {
    try {
      await deleteTravelDocumentBlob(previousPathname);
    } catch {
      console.error("Failed to delete previous travel document blob");
    }
  }
}

export async function deleteTravelDocument(input: {
  tripId: string;
  documentId: string;
}): Promise<void> {
  await connectDb();
  const deleted = await TravelDocument.findOneAndDelete({
    _id: input.documentId,
    tripId: input.tripId,
  }).lean();

  if (!deleted) {
    throw new TravelDocumentNotFoundError();
  }

  if (!deleted?.file?.pathname) {
    return;
  }

  try {
    await deleteTravelDocumentBlob(deleted.file.pathname);
  } catch {
    console.error("Failed to delete travel document blob after DB removal");
  }
}

export async function getTravelDocumentPathname(
  tripId: string,
  documentId: string,
): Promise<{ pathname: string; contentType: string; originalFilename?: string } | null> {
  await connectDb();
  const document = await TravelDocument.findOne({
    _id: documentId,
    tripId,
  }).lean();

  if (!document) {
    return null;
  }

  if (!document?.file?.pathname) {
    return null;
  }

  return {
    pathname: document.file.pathname,
    contentType: document.file.contentType,
    originalFilename: document.file.originalFilename ?? undefined,
  };
}
