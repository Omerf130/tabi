import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { DocumentDetailContent } from "@/features/documents/DocumentDetailContent";
import { getTravelDocumentForTrip } from "@/features/documents/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; documentId: string }>;
}): Promise<Metadata> {
  const { tripId, documentId } = await params;
  const trip = await requireTripMember(tripId);
  const document = await getTravelDocumentForTrip(trip.id, documentId);
  const title = document?.title ?? "מסמך";
  return { title: `${title} · ${trip.name}` };
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ tripId: string; documentId: string }>;
}) {
  const { tripId, documentId } = await params;
  const trip = await requireTripMember(tripId);
  const document = await getTravelDocumentForTrip(trip.id, documentId);

  if (!document) {
    notFound();
  }

  return (
    <>
      <TripHeader
        title={document.title}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/documents`}
      />
      <DocumentDetailContent document={document} />
    </>
  );
}
