import type { Metadata } from "next";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { AccommodationsPageContent } from "@/features/accommodations/AccommodationsPageContent";
import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `מקומות לינה · ${trip.name}` };
}

export default async function AccommodationsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const accommodations = await listAccommodationsForTrip(trip.id);

  return (
    <>
      <TripHeader
        title="מקומות לינה"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <AccommodationsPageContent
        tripId={trip.id}
        accommodations={accommodations}
        isOwner={trip.role === "owner"}
      />
    </>
  );
}
