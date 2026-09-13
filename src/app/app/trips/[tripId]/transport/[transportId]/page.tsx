import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { listTravelDocumentsLinkedToTransport } from "@/features/documents/queries";
import { getTransportDetailViewModel } from "@/features/transport/queries";
import { TransportDetailContent } from "@/features/transport/TransportDetailContent";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; transportId: string }>;
}): Promise<Metadata> {
  const { tripId, transportId } = await params;
  const trip = await requireTripMember(tripId);
  const linkedDocuments = await listTravelDocumentsLinkedToTransport(trip.id, transportId);
  const transport = await getTransportDetailViewModel(trip.id, transportId, linkedDocuments);
  const t = await getTranslations("Transport");

  if (!transport) {
    return { title: `${t("errors.notFound")} · ${trip.name}` };
  }

  return {
    title: `${transport.typeLabel} · ${trip.name}`,
  };
}

export default async function TransportDetailPage({
  params,
}: {
  params: Promise<{ tripId: string; transportId: string }>;
}) {
  const { tripId, transportId } = await params;
  const trip = await requireTripMember(tripId);
  const linkedDocuments = await listTravelDocumentsLinkedToTransport(trip.id, transportId);
  const transport = await getTransportDetailViewModel(trip.id, transportId, linkedDocuments);

  if (!transport) {
    notFound();
  }

  return (
    <>
      <TripHeader
        title={transport.routeLabel}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/transport`}
      />
      <TransportDetailContent
        tripId={trip.id}
        transport={transport}
        isOwner={trip.role === "owner"}
      />
    </>
  );
}
