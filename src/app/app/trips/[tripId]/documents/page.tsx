import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Documents"),
  ]);
  return { title: `${t("listPageTitle")} · ${trip.name}` };
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Documents"),
  ]);
  const documents = await listTravelDocumentsForTrip(trip.id);

  return (
    <>
      <TripHeader
        title={t("listPageTitle")}
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
