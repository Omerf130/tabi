import type { Metadata } from "next";
import { PlaceholderPage } from "@/features/app-shell/PlaceholderPage";
import { TripHeader } from "@/features/app-shell/TripHeader";
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

export default async function DocumentsPlaceholderPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  return (
    <>
      <TripHeader
        title="מסמכים"
        tripName={trip.name}
        showTripSwitch
      />
      <PlaceholderPage message="מסמכי הטיול יגיעו בשלב הבא." />
    </>
  );
}
