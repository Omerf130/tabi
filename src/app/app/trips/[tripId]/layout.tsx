import { requireTripMember } from "@/features/trips/authorization";
import { TripShellLayout } from "@/features/app-shell/TripShellLayout";

export default async function TripLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}>) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);

  return (
    <TripShellLayout
      tripId={trip.id}
      tripName={trip.name}
      role={trip.role}
    >
      {children}
    </TripShellLayout>
  );
}
