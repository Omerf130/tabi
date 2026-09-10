import type { Metadata } from "next";
import { AppPage } from "@/features/app-shell/AppPage";
import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import { listTripListsSummary } from "@/features/lists/queries";
import { requireTripMember } from "@/features/trips/authorization";
import { prepareTravelHubPage } from "@/features/travel-hub/prepare-travel-hub-page";
import { TravelHubContent } from "@/features/travel-hub/TravelHubContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `עוד · ${trip.name}` };
}

export default async function TripMorePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  const [accommodations, lists] = await Promise.all([
    listAccommodationsForTrip(trip.id),
    listTripListsSummary(trip.id),
  ]);

  const model = await prepareTravelHubPage({
    trip: {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      coverImage: trip.coverImage,
      coverVisualKey: trip.coverVisualKey,
    },
    accommodations,
    lists,
  });

  return (
    <AppPage width="wide">
      <TravelHubContent model={model} />
    </AppPage>
  );
}
