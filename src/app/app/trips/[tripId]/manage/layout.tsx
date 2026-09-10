import { TripHeader } from "@/features/app-shell/TripHeader";
import { requireTripMember } from "@/features/trips/authorization";
import { TripManagementShell } from "@/features/trip-management/TripManagementShell";

export default async function TripManageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  return (
    <>
      <TripHeader
        title="ניהול הטיול"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <TripManagementShell tripId={trip.id} isOwner={trip.role === "owner"}>
        {children}
      </TripManagementShell>
    </>
  );
}
