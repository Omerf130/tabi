import type { Metadata } from "next";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { requireTripMember } from "@/features/trips/authorization";
import { ManagementHubContent } from "@/features/travel-hub/ManagementHubContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `הגדרות וניהול · ${trip.name}` };
}

export default async function TripManagePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  return (
    <>
      <TripHeader
        title="הגדרות וניהול"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <ManagementHubContent tripId={trip.id} />
    </>
  );
}
