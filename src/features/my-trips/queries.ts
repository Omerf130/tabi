import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import { TripMember, type TripMemberRole } from "@/models/TripMember";
import { getJapanCalendarDate } from "@/features/trips/calendar-date";
import { buildMyTripsCards } from "./build-my-trips-cards";
import type { MyTripsCardItem } from "./types";

export async function listMyTripsCardsForUser(
  userId: string,
): Promise<MyTripsCardItem[]> {
  await connectDb();
  const todayJapan = getJapanCalendarDate();
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

  return buildMyTripsCards(trips, roleByTripId, todayJapan);
}
