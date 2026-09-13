import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { EmergencyPageContent } from "@/features/emergency/EmergencyPageContent";
import { prepareEmergencyPage } from "@/features/emergency/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Emergency"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Emergency"),
  ]);
  const pageData = await prepareEmergencyPage(trip.id);

  return (
    <>
      <TripHeader
        title={t("pageTitle")}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <EmergencyPageContent {...pageData} />
    </>
  );
}
