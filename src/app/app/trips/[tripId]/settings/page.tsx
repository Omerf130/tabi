import type { Metadata } from "next";
import { requireTripMember } from "@/features/trips/authorization";
import { SettingsLegacyRedirect } from "@/features/trip-management/SettingsLegacyRedirect.client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `הגדרות · ${trip.name}` };
}

export default async function TripSettingsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId);

  return <SettingsLegacyRedirect tripId={tripId} />;
}
