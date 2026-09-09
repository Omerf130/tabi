import type { Metadata } from "next";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { listTransportCardsForTrip } from "@/features/transport/queries";
import { TransportPageContent } from "@/features/transport/TransportPageContent";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `תחבורה · ${trip.name}` };
}

export default async function TransportPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const groupedTransports = await listTransportCardsForTrip(trip.id);

  return (
    <>
      <TripHeader
        title="תחבורה"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <TransportPageContent
        tripId={trip.id}
        groupedTransports={groupedTransports}
        isOwner={trip.role === "owner"}
      />
    </>
  );
}
