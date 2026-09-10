import type { Metadata } from "next";
import { AppPage } from "@/features/app-shell/AppPage";
import { requireUser } from "@/features/auth/session";
import { prepareTripHomePage } from "@/features/trip-home/prepare-trip-home-page";
import { TripHomeContent } from "@/features/trip-home/TripHomeContent";
import { requireTripMember } from "@/features/trips/authorization";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `${trip.name} · Tabi` };
}

export default async function TripHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ previewPhase?: string; previewTime?: string }>;
}) {
  const [{ tripId }, { previewPhase, previewTime }] = await Promise.all([
    params,
    searchParams,
  ]);
  const [trip, user] = await Promise.all([
    requireTripMember(tripId),
    requireUser(),
  ]);

  const model = await prepareTripHomePage(trip, user.id, {
    previewPhase,
    previewTime,
  });

  return (
    <AppPage width="wide">
      <TripHomeContent model={model} />
    </AppPage>
  );
}
