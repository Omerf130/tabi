import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripMember } from "@/models/TripMember";

export async function usersShareTripMembership(
  viewerUserId: string,
  targetUserId: string,
): Promise<boolean> {
  if (viewerUserId === targetUserId) {
    return true;
  }

  await connectDb();

  const viewerTripIds = await TripMember.find({ userId: viewerUserId })
    .distinct("tripId")
    .exec();

  if (viewerTripIds.length === 0) {
    return false;
  }

  const shared = await TripMember.exists({
    userId: targetUserId,
    tripId: { $in: viewerTripIds },
  });

  return Boolean(shared);
}
