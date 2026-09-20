import "server-only";

import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import { listEmergencyDocumentsForTrip } from "@/features/documents/queries";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import { requireUser } from "@/features/auth/session";
import { requireTripMember } from "@/features/trips/authorization";
import { buildEmergencyViewModel } from "./build-emergency-view-model";
import { listTripEmergencyResources } from "./trip-emergency-resource-domain";
import type { EmergencyPageViewModel } from "./types";

export async function prepareEmergencyPage(tripId: string): Promise<EmergencyPageViewModel> {
  const [trip, user] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
  ]);
  const [accommodations, customResources, emergencyDocuments, locale] = await Promise.all([
    listAccommodationsForTrip(trip.id),
    listTripEmergencyResources(trip.id),
    listEmergencyDocumentsForTrip(trip.id),
    resolveRequestLocale(),
  ]);
  const t = createAppTranslator("Emergency", locale);

  return buildEmergencyViewModel({
    tripId: trip.id,
    startDate: trip.startDate,
    endDate: trip.endDate,
    accommodations,
    customResources,
    emergencyDocuments,
    destinationCalendarTimeZone: trip.destinationCalendarTimeZone,
    preferredMapsApp: user.preferredMapsApp,
    t,
  });
}
