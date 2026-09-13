import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DayPageContent } from "@/features/itinerary/DayPageContent";
import { getTripDayNumber } from "@/features/trips/trip-days";
import { parseItineraryDateParam } from "@/features/itinerary/routes";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; date: string }>;
}): Promise<Metadata> {
  const { tripId, date } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("ItineraryPage"),
  ]);
  const resolvedDate = parseItineraryDateParam(date, trip.startDate, trip.endDate);
  if (!resolvedDate) {
    return { title: `${t("pageTitle")} · ${trip.name}` };
  }

  const dayNumber = getTripDayNumber(trip.startDate, trip.endDate, resolvedDate)!;
  return {
    title: `${t("dayPageTitle", { dayNumber })} · ${trip.name}`,
  };
}

export default async function ItineraryDayPage({
  params,
}: {
  params: Promise<{ tripId: string; date: string }>;
}) {
  const { tripId, date } = await params;
  const trip = await requireTripMember(tripId);
  const resolvedDate = parseItineraryDateParam(date, trip.startDate, trip.endDate);

  if (!resolvedDate) {
    notFound();
  }

  return <DayPageContent trip={trip} date={resolvedDate} />;
}
