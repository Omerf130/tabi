import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccommodationAddButton } from "@/features/accommodations/AccommodationAddButton.client";
import { AccommodationsPageContent } from "@/features/accommodations/AccommodationsPageContent";
import { prepareAccommodationsListPage } from "@/features/accommodations/prepare-accommodations-list-page";
import { listAccommodationsForTrip } from "@/features/accommodations/queries";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Accommodation"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function AccommodationsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Accommodation"),
  ]);
  const accommodations = await listAccommodationsForTrip(trip.id);
  const { items, currentTripDate } = await prepareAccommodationsListPage(
    trip.id,
    accommodations,
  );

  return (
    <>
      <TripHeader
        title={t("pageTitle")}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
        trailing={
          trip.role === "owner" ? (
            <AccommodationAddButton />
          ) : undefined
        }
      />
      <AccommodationsPageContent
        items={items}
        currentTripDate={currentTripDate}
        isOwner={trip.role === "owner"}
      />
    </>
  );
}
