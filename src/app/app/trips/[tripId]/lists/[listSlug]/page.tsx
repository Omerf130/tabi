import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripHeader } from "@/features/app-shell/TripHeader";
import {
  buildListsLandingHref,
  getTripListTypeFromSlug,
  isTripListSlug,
} from "@/features/lists/constants";
import { ListDetailContent } from "@/features/lists/ListDetailContent";
import { getTripListDetail } from "@/features/lists/queries";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string; listSlug: string }>;
}): Promise<Metadata> {
  const { tripId, listSlug } = await params;
  if (!isTripListSlug(listSlug)) {
    return { title: "רשימות" };
  }
  const trip = await requireTripMember(tripId);
  const list = await getTripListDetail(trip.id, getTripListTypeFromSlug(listSlug));
  return { title: `${list.title} · ${trip.name}` };
}

export default async function TripListDetailPage({
  params,
}: {
  params: Promise<{ tripId: string; listSlug: string }>;
}) {
  const { tripId, listSlug } = await params;
  if (!isTripListSlug(listSlug)) {
    notFound();
  }

  const trip = await requireTripMember(tripId);
  const list = await getTripListDetail(trip.id, getTripListTypeFromSlug(listSlug));

  return (
    <>
      <TripHeader
        title={list.title}
        tripName={trip.name}
        showTripSwitch
        backHref={buildListsLandingHref(tripId)}
      />
      <ListDetailContent tripId={trip.id} list={list} />
    </>
  );
}
