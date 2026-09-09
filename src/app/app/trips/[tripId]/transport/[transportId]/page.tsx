import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listTravelDocumentsLinkedToTransport } from "@/features/documents/queries";
import { TRANSPORT_MESSAGES } from "@/features/transport/constants";
import { getTransportDetailViewModel } from "@/features/transport/queries";
import { TransportDetailContent } from "@/features/transport/TransportDetailContent";
import { TRANSPORT_TYPE_SINGULAR_LABELS } from "@/features/transport/transport-types";
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

  if (!transport) {
    return { title: `${TRANSPORT_MESSAGES.notFound} · ${trip.name}` };
  }

  return {
    title: `${TRANSPORT_TYPE_SINGULAR_LABELS[transport.type]} · ${trip.name}`,
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
