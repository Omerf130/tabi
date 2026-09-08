import type { Metadata } from "next";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { DocumentsPageContent } from "@/features/documents/DocumentsPageContent";
import { listTravelDocumentsForTrip } from "@/features/documents/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `מסמכים · ${trip.name}` };
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const documents = await listTravelDocumentsForTrip(trip.id);

  return (
    <>
      <TripHeader
        title="מסמכים"
        tripName={trip.name}
        showTripSwitch
      />
      <DocumentsPageContent
        tripId={trip.id}
        documents={documents}
        isOwner={trip.role === "owner"}
      />
    </>
  );
}
