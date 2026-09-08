import { redirect } from "next/navigation";
import { resolveDefaultActivityDate } from "@/features/itinerary/resolve-default-activity-date";
import { requireTripOwner } from "@/features/trips/authorization";

export default async function NewActivityRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { tripId } = await params;
  const { date } = await searchParams;
  const trip = await requireTripOwner(tripId);
  const resolvedDate = resolveDefaultActivityDate(trip, date);
  redirect(`/app/trips/${tripId}/itinerary?date=${resolvedDate}`);
}
