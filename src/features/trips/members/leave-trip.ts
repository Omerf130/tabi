import "server-only";

import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { TripMember } from "@/models/TripMember";
import { serializeTripMutation } from "@/features/trips/trip-serialization";
import { LastOwnerError, MemberNotFoundError } from "./errors";
import { wouldLeaveZeroOwners } from "./owner-invariant";

/** Removes the authenticated user's own membership only. */
export async function leaveTrip(userId: string, tripId: string): Promise<void> {
  await connectDb();

  await withTransaction(async (session) => {
    await serializeTripMutation(tripId, session);

    const membership = await TripMember.findOne({ tripId, userId }).session(
      session,
    );

    if (!membership) {
      throw new MemberNotFoundError();
    }

    if (membership.role === "owner") {
      const ownerCount = await TripMember.countDocuments({
        tripId,
        role: "owner",
      }).session(session);

      if (wouldLeaveZeroOwners(ownerCount, true)) {
        throw new LastOwnerError();
      }
    }

    await TripMember.deleteOne({ _id: membership._id, tripId }).session(session);
  });
}
