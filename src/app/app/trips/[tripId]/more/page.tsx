import type { Metadata } from "next";
import { MorePageContent } from "@/features/app-shell/MorePageContent";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `עוד · ${trip.name}` };
}

export default async function TripMorePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  return (
    <>
      <TripHeader title="עוד" tripName={trip.name} showTripSwitch />
      <MorePageContent tripId={tripId} />
    </>
  );
}
