import "server-only";

import { cache } from "react";
import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { TripMember, type TripMemberRole } from "@/models/TripMember";
import { getJapanCalendarDate } from "./calendar-date";
import { toTripListItem, toTripWorkspace, type TripListItem, type TripWorkspace } from "./public-trip";
import { sortTripListItems } from "./trip-sort";

export async function listTripsForUser(userId: string): Promise<TripListItem[]> {
  await connectDb();
  const todayJapan = getJapanCalendarDate();
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

  const items = tripIds
    .map((tripId) => {
      const trip = tripById.get(tripId.toString());
      const role = roleByTripId.get(tripId.toString());
      if (!trip || !role) {
        return null;
      }
      return toTripListItem(trip, role, todayJapan);
    })
    .filter((item): item is TripListItem => item !== null);

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
    return {
      trip: toTripWorkspace(trip, role),
      role,
    };
  },
);

export async function countTripsForUser(userId: string): Promise<number> {
  await connectDb();
  return TripMember.countDocuments({ userId });
}
