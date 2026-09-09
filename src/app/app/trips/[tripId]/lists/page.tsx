import type { Metadata } from "next";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { ListsLandingContent } from "@/features/lists/ListsLandingContent";
import { listTripListsSummary } from "@/features/lists/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `רשימות · ${trip.name}` };
}

export default async function TripListsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  const lists = await listTripListsSummary(trip.id);

  return (
    <>
      <TripHeader
        title="רשימות"
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <ListsLandingContent tripId={trip.id} lists={lists} />
    </>
  );
}
