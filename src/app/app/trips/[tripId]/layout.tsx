import { requireTripMember } from "@/features/trips/authorization";
import { TripShellLayout } from "@/features/app-shell/TripShellLayout";
import { loadQuickAddBootstrap } from "@/features/quick-add/load-quick-add-bootstrap.server";

export default async function TripLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}>) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const quickAddBootstrap = await loadQuickAddBootstrap(trip);

  return (
    <TripShellLayout
      tripId={trip.id}
      tripName={trip.name}
      role={trip.role}
      themeKey={trip.themeKey}
      quickAddBootstrap={quickAddBootstrap}
    >
      {children}
    </TripShellLayout>
  );
}
