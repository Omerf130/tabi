import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireTripMember } from "@/features/trips/authorization";
import { buildTripManagementHref } from "@/features/trip-management/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await requireTripMember(tripId);
  return { title: `חברי הטיול · ${trip.name}` };
}

export default async function TripMembersPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  await requireTripMember(tripId);
  redirect(buildTripManagementHref(tripId, "members"));
}
