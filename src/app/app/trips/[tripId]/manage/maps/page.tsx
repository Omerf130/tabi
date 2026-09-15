import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireTripMember } from "@/features/trips/authorization";
import { MapsSettingsContent } from "@/features/settings/maps/MapsSettingsContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Settings"),
  ]);
  return { title: `${t("rows.maps.title")} · ${trip.name}` };
}

export default async function TripSettingsMapsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId);
  return <MapsSettingsContent tripId={tripId} />;
}
