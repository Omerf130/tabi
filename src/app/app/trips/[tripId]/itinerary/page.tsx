import type { Metadata } from "next";
import { ItineraryPageContent } from "@/features/itinerary/ItineraryPageContent";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `מסלול · ${trip.name}` };
}

export default async function ItineraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { tripId } = await params;
  const { date } = await searchParams;
  const trip = await requireTripMember(tripId);

  return (
    <>
      <TripHeader title="מסלול" tripName={trip.name} showTripSwitch />
      <ItineraryPageContent trip={trip} requestedDate={date} />
    </>
  );
}
