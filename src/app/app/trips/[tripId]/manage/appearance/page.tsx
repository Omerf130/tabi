import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AppearanceSettingsContent } from "@/features/settings/appearance/AppearanceSettingsContent";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("TripTheme"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function AppearanceSettingsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <AppearanceSettingsContent tripId={tripId} />;
}
