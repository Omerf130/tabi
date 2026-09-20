import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { TripMember, type TripMemberRole } from "@/models/TripMember";
import { ensureTripDestinationTimeZone } from "@/features/trips/destination/ensure-trip-destination-time-zone";
import { getCalendarDateInTimeZone } from "@/features/trips/destination/trip-local-calendar";
import { buildMyTripsCards } from "./build-my-trips-cards";
import type { MyTripsCardItem } from "./types";

export async function listMyTripsCardsForUser(
  userId: string,
): Promise<MyTripsCardItem[]> {
  await connectDb();
  const memberships = await TripMember.find({ userId }).lean();

  if (memberships.length === 0) {
    return [];
  }

  const tripIds = memberships.map((membership) => membership.tripId);
  const trips = await Trip.find({ _id: { $in: tripIds } }).lean();
  const roleByTripId = new Map<string, TripMemberRole>(
    memberships.map((membership) => [
      membership.tripId.toString(),
      membership.role as TripMemberRole,
    ]),
  );

  const todayTripLocalByTripId = new Map<string, string>();
  for (const trip of trips) {
    const tripId = trip._id.toString();
    const destinationTimeZone = await ensureTripDestinationTimeZone(
      tripId,
      trip.destination ?? undefined,
    );
    todayTripLocalByTripId.set(
      tripId,
      getCalendarDateInTimeZone(destinationTimeZone),
    );
  }

  return buildMyTripsCards(trips, roleByTripId, todayTripLocalByTripId);
}
