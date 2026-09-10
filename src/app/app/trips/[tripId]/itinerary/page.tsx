import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  buildItineraryDayHref,
  parseItineraryDateParam,
} from "@/features/itinerary/routes";
import { resolveInitialItineraryDay } from "@/features/itinerary/resolve-initial-itinerary-day";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `מסלול · ${trip.name}` };
}

export default async function ItineraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { tripId } = await params;
  const { date } = await searchParams;
  const trip = await requireTripMember(tripId);

  const requestedDate = date
    ? parseItineraryDateParam(date, trip.startDate, trip.endDate)
    : null;
  const canonicalDate = resolveInitialItineraryDay(
    trip,
    requestedDate,
  );

  redirect(buildItineraryDayHref(tripId, canonicalDate));
}
