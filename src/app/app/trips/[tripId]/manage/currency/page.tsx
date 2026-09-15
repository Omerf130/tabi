import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CurrencySettingsContent } from "@/features/settings/currency/CurrencySettingsContent";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("CurrencySettings"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function CurrencySettingsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <CurrencySettingsContent tripId={tripId} />;
}
