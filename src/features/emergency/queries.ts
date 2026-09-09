import "server-only";

import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import { listEmergencyDocumentsForTrip } from "@/features/documents/queries";
import { requireTripMember } from "@/features/trips/authorization";
import { buildEmergencyViewModel } from "./build-emergency-view-model";
import { listTripEmergencyResources } from "./trip-emergency-resource-domain";
import type { EmergencyPageViewModel } from "./types";

export async function prepareEmergencyPage(tripId: string): Promise<EmergencyPageViewModel> {
  const trip = await requireTripMember(tripId);
  const [accommodations, customResources, emergencyDocuments] = await Promise.all([
    listAccommodationsForTrip(trip.id),
    listTripEmergencyResources(trip.id),
    listEmergencyDocumentsForTrip(trip.id),
  ]);

  return buildEmergencyViewModel({
    tripId: trip.id,
    startDate: trip.startDate,
    endDate: trip.endDate,
    accommodations,
    customResources,
    emergencyDocuments,
  });
}
