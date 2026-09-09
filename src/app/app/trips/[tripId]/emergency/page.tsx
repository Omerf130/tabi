import type { Metadata } from "next";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { EMERGENCY_PAGE_TITLE } from "@/features/emergency/constants";
import { EmergencyPageContent } from "@/features/emergency/EmergencyPageContent";
import { prepareEmergencyPage } from "@/features/emergency/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `${EMERGENCY_PAGE_TITLE} · ${trip.name}` };
}

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const pageData = await prepareEmergencyPage(trip.id);

  return (
    <>
      <TripHeader
        title={EMERGENCY_PAGE_TITLE}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <EmergencyPageContent {...pageData} />
    </>
  );
}
