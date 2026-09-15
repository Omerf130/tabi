import "server-only";

import type { ClientSession } from "mongoose";
import { connectDb } from "@/lib/db/connect";
import { TravelDocument } from "@/models/TravelDocument";

export type ClearTravelDocumentEntityLinkInput = {
  tripId: string;
  activityId?: string;
  accommodationId?: string;
  transportId?: string;
  session?: ClientSession;
};

export async function clearTravelDocumentEntityLinks(
  input: ClearTravelDocumentEntityLinkInput,
): Promise<number> {
  const linkCount = [
    input.activityId,
    input.accommodationId,
    input.transportId,
  ].filter(Boolean).length;
  if (linkCount !== 1) {
    throw new Error("Exactly one entity link must be specified");
  }

  await connectDb();

  const filter: Record<string, unknown> = { tripId: input.tripId };
  const update: Record<string, null> = {};

  if (input.activityId) {
    filter.activityId = input.activityId;
    update.activityId = null;
  } else if (input.accommodationId) {
    filter.accommodationId = input.accommodationId;
    update.accommodationId = null;
  } else if (input.transportId) {
    filter.transportId = input.transportId;
    update.transportId = null;
  }

  const query = TravelDocument.updateMany(filter, { $set: update });
  if (input.session) {
    query.session(input.session);
  }
  const result = await query;
  return result.modifiedCount ?? 0;
}
