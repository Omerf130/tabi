import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { listTransportCardsForTrip } from "@/features/transport/queries";
import { TransportAddMenu } from "@/features/transport/TransportAddMenu.client";
import { TransportPageContent } from "@/features/transport/TransportPageContent";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Transport"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function TransportPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Transport"),
  ]);
  const groupedTransports = await listTransportCardsForTrip(trip.id);

  return (
    <>
      <TripHeader
        title={t("pageTitle")}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
        trailing={
          trip.role === "owner" ? <TransportAddMenu tripId={trip.id} /> : undefined
        }
      />
      <TransportPageContent
        tripId={trip.id}
        groupedTransports={groupedTransports}
        isOwner={trip.role === "owner"}
      />
    </>
  );
}
