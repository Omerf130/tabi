import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxiModeOverlay } from "@/features/accommodations/TaxiModeOverlay";
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
  const title = accommodation?.name ?? "מצב מונית";
  return { title: `מצב מונית · ${title}` };
}

export default async function AccommodationTaxiPage({
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

  return <TaxiModeOverlay tripId={trip.id} accommodation={accommodation} />;
}
