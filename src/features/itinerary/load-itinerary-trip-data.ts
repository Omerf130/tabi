import "server-only";

import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import { listTravelDocumentRecordsForTrip } from "@/features/documents/queries";
import type { ResolvedTravelDocumentViewModel } from "@/features/documents/types";
import { resolveTravelDocumentsBatch } from "@/features/documents/resolve-travel-documents-batch";
import { listTransportsForItineraryTrip, listTransportsForTrip } from "@/features/transport/queries";
import type { TransportItineraryItemViewModel, TransportRecord } from "@/features/transport/types";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import { listActivitiesForTrip } from "./queries";
import type { ActivityViewModel } from "./types";

export type ItineraryTripData = {
  activities: ActivityViewModel[];
  transportsByDate: Map<string, TransportItineraryItemViewModel[]>;
  accommodations: AccommodationViewModel[];
  documents: ResolvedTravelDocumentViewModel[];
  activityById: Map<string, ActivityViewModel>;
  accommodationById: Map<string, AccommodationViewModel>;
  transportById: Map<string, TransportRecord>;
};

export async function loadItineraryTripData(
  tripId: string,
  startDate: string,
  endDate: string,
): Promise<ItineraryTripData> {
  const [
    activities,
    transportsByDate,
    accommodations,
    documentRecords,
    transportRecords,
  ] = await Promise.all([
    listActivitiesForTrip(tripId),
    listTransportsForItineraryTrip(tripId, startDate, endDate),
    listAccommodationsForTrip(tripId),
    listTravelDocumentRecordsForTrip(tripId),
    listTransportsForTrip(tripId),
  ]);

  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const accommodationById = new Map(
    accommodations.map((accommodation) => [accommodation.id, accommodation]),
  );
  const transportById = new Map(
    transportRecords.map((transport) => [transport.id, transport]),
  );

  const documents = resolveTravelDocumentsBatch(
    tripId,
    documentRecords,
    activityById,
    accommodationById,
    transportById,
  );

  return {
    activities,
    transportsByDate,
    accommodations,
    documents,
    activityById,
    accommodationById,
    transportById,
  };
}
