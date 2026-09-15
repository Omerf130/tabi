import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireTripMember } from "@/features/trips/authorization";
import { TripDetailsSettingsContent } from "@/features/trips/settings/trip-details/TripDetailsSettingsContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("TripDetailsSettings"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function TripDetailsSettingsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TripDetailsSettingsContent tripId={tripId} />;
}
