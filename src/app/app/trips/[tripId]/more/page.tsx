import type { Metadata } from "next";
import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import { TripHeader } from "@/features/app-shell/TripHeader";
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
  return { title: `מרכז הטיול · ${trip.name}` };
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
    tripId: trip.id,
    startDate: trip.startDate,
    endDate: trip.endDate,
    accommodations,
    lists,
  });

  return (
    <>
      <TripHeader title="מרכז הטיול" tripName={trip.name} showTripSwitch />
      <TravelHubContent model={model} />
    </>
  );
}
