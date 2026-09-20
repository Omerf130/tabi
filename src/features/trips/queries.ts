import "server-only";

import { cache } from "react";
import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { TripMember, type TripMemberRole } from "@/models/TripMember";
import { ensureTripDestinationTimeZone } from "./destination/ensure-trip-destination-time-zone";
import { getCalendarDateInTimeZone } from "./destination/trip-local-calendar";
import { toTripListItem, toTripWorkspace, type TripListItem, type TripWorkspace } from "./public-trip";
import { sortTripListItems } from "./trip-sort";

export async function listTripsForUser(userId: string): Promise<TripListItem[]> {
  await connectDb();
  const memberships = await TripMember.find({ userId }).lean();

  if (memberships.length === 0) {
    return [];
  }

  const tripIds = memberships.map((membership) => membership.tripId);
  const trips = await Trip.find({ _id: { $in: tripIds } }).lean();
  const tripById = new Map(trips.map((trip) => [trip._id.toString(), trip]));
  const roleByTripId = new Map(
    memberships.map((membership) => [
      membership.tripId.toString(),
      membership.role as TripMemberRole,
    ]),
  );

  const items: TripListItem[] = [];
  for (const tripId of tripIds) {
    const trip = tripById.get(tripId.toString());
    const role = roleByTripId.get(tripId.toString());
    if (!trip || !role) {
      continue;
    }
    const tripIdStr = trip._id.toString();
    const destinationTimeZone = await ensureTripDestinationTimeZone(
      tripIdStr,
      trip.destination ?? undefined,
    );
    const todayTripLocal = getCalendarDateInTimeZone(destinationTimeZone);
    items.push(toTripListItem(trip, role, todayTripLocal));
  }

  return sortTripListItems(items);
}

export const getTripWithMembership = cache(
  async (
    userId: string,
    tripId: string,
  ): Promise<{ trip: TripWorkspace; role: TripMemberRole } | null> => {
    await connectDb();
    const membership = await TripMember.findOne({ userId, tripId }).lean();
    if (!membership) {
      return null;
    }

    const trip = await Trip.findById(tripId).lean();
    if (!trip) {
      return null;
    }

    const role = membership.role as TripMemberRole;
    const tripIdStr = trip._id.toString();
    const destinationTimeZone = await ensureTripDestinationTimeZone(
      tripIdStr,
      trip.destination ?? undefined,
    );
    return {
      trip: toTripWorkspace(trip, role, destinationTimeZone),
      role,
    };
  },
);

export async function countTripsForUser(userId: string): Promise<number> {
  await connectDb();
  return TripMember.countDocuments({ userId });
}
