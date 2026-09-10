import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Activity } from "@/models/Activity";
import { Transport } from "@/models/Transport";

type DocumentLinkMetadata = {
  activityId?: string;
  accommodationId?: string;
  transportId?: string;
};

export async function resolveDocumentItineraryDates(
  tripId: string,
  metadata: DocumentLinkMetadata,
): Promise<string[]> {
  if (metadata.activityId) {
    await connectDb();
    const activity = await Activity.findOne({
      _id: metadata.activityId,
      tripId,
    }).lean();
    return activity ? [activity.date] : [];
  }

  if (metadata.transportId) {
    await connectDb();
    const transport = await Transport.findOne({
      _id: metadata.transportId,
      tripId,
    }).lean();
    return transport ? [transport.departure.date] : [];
  }

  return [];
}
