import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireTripMember } from "@/features/trips/authorization";
import { SettingsLanguageContent } from "@/features/settings/SettingsLanguageContent";

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
  return { title: `${t("rows.language.title")} · ${trip.name}` };
}

export default async function TripSettingsLanguagePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId);
  return <SettingsLanguageContent tripId={tripId} />;
}
