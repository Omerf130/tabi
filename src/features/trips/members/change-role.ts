import "server-only";

import { connectDb } from "@/lib/db/connect";
import { withTransaction } from "@/lib/db/transaction";
import { TripMember } from "@/models/TripMember";
import type { TripMemberRole } from "@/models/TripMember";
import { serializeTripMutation } from "@/features/trips/trip-serialization";
import { LastOwnerError, MemberNotFoundError } from "./errors";
import { wouldLeaveZeroOwners } from "./owner-invariant";

export async function changeTripMemberRole(
  tripId: string,
  membershipId: string,
  role: TripMemberRole,
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

    if (membership.role === role) {
      return;
    }

    if (membership.role === "owner" && role === "member") {
      const ownerCount = await TripMember.countDocuments({
        tripId,
        role: "owner",
      }).session(session);

      if (wouldLeaveZeroOwners(ownerCount, true)) {
        throw new LastOwnerError();
      }
    }

    membership.role = role;
    await membership.save({ session });
  });
}
