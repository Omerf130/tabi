import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TripHeader } from "@/features/app-shell/TripHeader";
import { ListsLandingContent } from "@/features/lists/ListsLandingContent";
import { listTripListsSummary } from "@/features/lists/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Lists"),
  ]);
  return { title: `${t("pageTitle")} · ${trip.name}` };
}

export default async function TripListsPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const [trip, t] = await Promise.all([
    requireTripMember(tripId),
    getTranslations("Lists"),
  ]);
  const lists = await listTripListsSummary(trip.id);

  return (
    <>
      <TripHeader
        title={t("pageTitle")}
        tripName={trip.name}
        showTripSwitch
        backHref={`/app/trips/${tripId}/more`}
      />
      <ListsLandingContent tripId={trip.id} lists={lists} />
    </>
  );
}
