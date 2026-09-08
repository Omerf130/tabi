import "server-only";

import { cache } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { connectDb } from "@/lib/db/connect";
import { TripMember, type TripMemberRole } from "@/models/TripMember";
import { isValidObjectId } from "./object-id";
import { getTripWithMembership } from "./queries";
import type { TripWorkspace } from "./public-trip";

export async function getTripMembership(
  userId: string,
  tripId: string,
): Promise<{ role: TripMemberRole } | null> {
  if (!isValidObjectId(tripId)) {
    return null;
  }

  await connectDb();
  const membership = await TripMember.findOne({ userId, tripId }).lean();
  if (!membership) {
    return null;
  }

  return { role: membership.role as TripMemberRole };
}

export const requireTripMember = cache(
  async (tripId: string): Promise<TripWorkspace> => {
    const user = await requireUser();
    if (!isValidObjectId(tripId)) {
      notFound();
    }

    const result = await getTripWithMembership(user.id, tripId);
    if (!result) {
      notFound();
    }

    return result.trip;
  },
);

export const requireTripOwner = cache(
  async (tripId: string): Promise<TripWorkspace> => {
    const trip = await requireTripMember(tripId);
    if (trip.role !== "owner") {
      notFound();
    }
    return trip;
  },
);
