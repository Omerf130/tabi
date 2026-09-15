import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireTripMember } from "@/features/trips/authorization";
import { TravelersSettingsContent } from "@/features/trips/settings/travelers/TravelersSettingsContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("TravelersSettings"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function TravelersSettingsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TravelersSettingsContent tripId={tripId} />;
}
