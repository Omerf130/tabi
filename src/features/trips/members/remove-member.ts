import "server-only";

import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { TripMember } from "@/models/TripMember";
import { serializeTripMutation } from "@/features/trips/trip-serialization";
import { LastOwnerError, MemberNotFoundError } from "./errors";
import { wouldLeaveZeroOwners } from "./owner-invariant";

export async function removeTripMember(
  tripId: string,
  membershipId: string,
): Promise<void> {
  await connectDb();

  await withTransaction(async (session) => {
    await serializeTripMutation(tripId, session);

    const membership = await TripMember.findOne({
      _id: membershipId,
      tripId,
    }).session(session);

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

    await TripMember.deleteOne({ _id: membershipId, tripId }).session(session);
  });
}
