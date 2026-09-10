import { notFound, redirect } from "next/navigation";
import { getActivityForTrip } from "@/features/itinerary/queries";
import { requireTripOwner } from "@/features/trips/authorization";

export default async function EditActivityRedirectPage({
  params,
}: {
  params: Promise<{ tripId: string; activityId: string }>;
}) {
  const { tripId, activityId } = await params;
  const trip = await requireTripOwner(tripId);
  const activity = await getActivityForTrip(trip.id, activityId);

  if (!activity) {
    notFound();
  }

  redirect(`/app/trips/${tripId}/itinerary/${activity.date}`);
}
