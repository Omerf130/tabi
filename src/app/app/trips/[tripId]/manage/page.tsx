import { redirect } from "next/navigation";
import {
  buildTripManagementHref,
  DEFAULT_TRIP_MANAGEMENT_SECTION,
} from "@/features/trip-management/constants";

export default async function TripManagePage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  redirect(buildTripManagementHref(tripId, DEFAULT_TRIP_MANAGEMENT_SECTION));
}
