import { TripManagementShell } from "@/features/trip-management/TripManagementShell";
import { requireTripMember } from "@/features/trips/authorization";

export default async function TripManageSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  return (
    <TripManagementShell tripId={trip.id} isOwner={trip.role === "owner"}>
      {children}
    </TripManagementShell>
  );
}
