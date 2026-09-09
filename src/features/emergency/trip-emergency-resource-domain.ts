import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripEmergencyResource } from "@/models/TripEmergencyResource";
import { EMERGENCY_MESSAGES } from "./constants";
import type {
  CreateTripEmergencyResourceInput,
  UpdateTripEmergencyResourceInput,
} from "./schemas";

export class TripEmergencyResourceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TripEmergencyResourceValidationError";
  }
}

export class TripEmergencyResourceNotFoundError extends Error {
  constructor() {
    super(EMERGENCY_MESSAGES.notFound);
    this.name = "TripEmergencyResourceNotFoundError";
  }
}

function toNullable(value?: string): string | null {
  return value?.trim() ? value.trim() : null;
}

function toResourceFields(input: {
  category: CreateTripEmergencyResourceInput["category"];
  title: string;
  phone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  url?: string;
  reference?: string;
  notes?: string;
}) {
  return {
    category: input.category,
    title: input.title.trim(),
    phone: toNullable(input.phone),
    secondaryPhone: toNullable(input.secondaryPhone),
    email: toNullable(input.email),
    address: toNullable(input.address),
    url: toNullable(input.url),
    reference: toNullable(input.reference),
    notes: toNullable(input.notes),
  };
}

export async function listTripEmergencyResources(tripId: string) {
  await connectDb();
  return TripEmergencyResource.find({ tripId })
    .sort({ createdAt: 1, _id: 1 })
    .lean();
}

export async function createTripEmergencyResource(input: {
  tripId: string;
  userId: string;
  data: CreateTripEmergencyResourceInput;
}): Promise<string> {
  await connectDb();
  const created = await TripEmergencyResource.create({
    tripId: input.tripId,
    createdBy: input.userId,
    ...toResourceFields(input.data),
  });
  return created._id.toString();
}

export async function updateTripEmergencyResource(input: {
  tripId: string;
  resourceId: string;
  data: UpdateTripEmergencyResourceInput;
}): Promise<void> {
  await connectDb();
  const updated = await TripEmergencyResource.findOneAndUpdate(
    { _id: input.resourceId, tripId: input.tripId },
    toResourceFields(input.data),
    { new: true, runValidators: true },
  ).lean();

  if (!updated) {
    throw new TripEmergencyResourceNotFoundError();
  }
}

export async function deleteTripEmergencyResource(input: {
  tripId: string;
  resourceId: string;
}): Promise<void> {
  await connectDb();
  const deleted = await TripEmergencyResource.findOneAndDelete({
    _id: input.resourceId,
    tripId: input.tripId,
  }).lean();

  if (!deleted) {
    throw new TripEmergencyResourceNotFoundError();
  }
}
