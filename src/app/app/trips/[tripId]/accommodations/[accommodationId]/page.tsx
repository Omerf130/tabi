import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { AccommodationDetailContent } from "@/features/accommodations/AccommodationDetailContent";
import { getAccommodationForTrip } from "@/features/accommodations/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; accommodationId: string }>;
}): Promise<Metadata> {
  const { tripId, accommodationId } = await params;
  const trip = await requireTripMember(tripId);
  const accommodation = await getAccommodationForTrip(trip.id, accommodationId);
  const title = accommodation?.name ?? "מקום לינה";
  return { title: `${title} · ${trip.name}` };
}

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ tripId: string; accommodationId: string }>;
}) {
  const { tripId, accommodationId } = await params;
  const trip = await requireTripMember(tripId);
  const accommodation = await getAccommodationForTrip(trip.id, accommodationId);

  if (!accommodation) {
    notFound();
  }

  return (
    <>
      <TripHeader
        title={accommodation.name}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/accommodations`}
      />
      <AccommodationDetailContent tripId={trip.id} accommodation={accommodation} />
    </>
  );
}
