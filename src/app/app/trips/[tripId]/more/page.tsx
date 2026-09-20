import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppPage } from "@/features/app-shell/AppPage";
import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import { listTravelDocumentsForTrip } from "@/features/documents/queries";
import { listTripListsSummary } from "@/features/lists/queries";
import { listTransportsForTrip } from "@/features/transport/queries";
import { requireTripMember } from "@/features/trips/authorization";
import { prepareTravelHubPage } from "@/features/travel-hub/prepare-travel-hub-page";
import { TravelHubContent } from "@/features/travel-hub/TravelHubContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("More"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function TripMorePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  const [accommodations, lists, transports, documents] = await Promise.all([
    listAccommodationsForTrip(trip.id),
    listTripListsSummary(trip.id),
    listTransportsForTrip(trip.id),
    listTravelDocumentsForTrip(trip.id),
  ]);

  const model = await prepareTravelHubPage({
    trip: {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      coverImage: trip.coverImage,
      coverVisualKey: trip.coverVisualKey,
      destinationCalendarTimeZone: trip.destinationCalendarTimeZone,
    },
    accommodations,
    transports,
    lists,
    documentCount: documents.length,
  });

  return (
    <AppPage width="wide">
      <TravelHubContent model={model} />
    </AppPage>
  );
}
