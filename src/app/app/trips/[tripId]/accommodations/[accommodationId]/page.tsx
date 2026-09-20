import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { AccommodationDetailContent } from "@/features/accommodations/AccommodationDetailContent";
import { getAccommodationForTrip } from "@/features/accommodations/queries";
import { requireUser } from "@/features/auth/session";
import { buildAccommodationNavigationHref } from "@/lib/maps/navigation-entities";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; accommodationId: string }>;
}): Promise<Metadata> {
  const { tripId, accommodationId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Accommodation"),
  ]);
  const accommodation = await getAccommodationForTrip(trip.id, accommodationId);
  const title = accommodation?.name ?? t("fallbackName");
  return { title: `${title} · ${trip.name}` };
}

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ tripId: string; accommodationId: string }>;
}) {
  const { tripId, accommodationId } = await params;
  const [trip, user] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
  ]);
  const accommodation = await getAccommodationForTrip(trip.id, accommodationId);

  if (!accommodation) {
    notFound();
  }

  const mapsNavigationHref =
    buildAccommodationNavigationHref(accommodation, user.preferredMapsApp) ??
    undefined;

  return (
    <>
      <TripHeader
        title={accommodation.name}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/accommodations`}
      />
      <AccommodationDetailContent
        tripId={trip.id}
        accommodation={accommodation}
        mapsNavigationHref={mapsNavigationHref}
        destinationCountryCode={trip.destination?.countryCode}
      />
    </>
  );
}
