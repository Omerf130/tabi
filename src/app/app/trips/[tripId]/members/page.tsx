import type { Metadata } from "next";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { requireTripMember } from "@/features/trips/authorization";
import { MembersPageContent } from "@/features/trips/members/MembersPageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `חברי הטיול · ${trip.name}` };
}

export default async function TripMembersPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  return (
    <>
      <TripHeader
        title="חברי הטיול"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <MembersPageContent tripId={tripId} />
    </>
  );
}
