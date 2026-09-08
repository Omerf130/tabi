import "server-only";

import { connectDb } from "@/lib/db/connect";
import { hashToken } from "@/lib/crypto/tokens";
import { withTransaction } from "@/lib/db/transaction";
import { Trip } from "@/models/Trip";
import { TripInvitation } from "@/models/TripInvitation";
import { TripMember } from "@/models/TripMember";
import { AlreadyMemberError, InviteInvalidError } from "./errors";
import { isInvitationValid } from "./public-invite";

export async function acceptTripInvitation(
  userId: string,
  rawToken: string,
): Promise<string> {
  await connectDb();

  const tokenHash = hashToken(rawToken);
  const now = new Date();

  return withTransaction(async (session) => {
    const invitation = await TripInvitation.findOne({ tokenHash }).session(
      session,
    );

    if (!invitation || !isInvitationValid(invitation, now)) {
      throw new InviteInvalidError();
    }

    const tripId = invitation.tripId.toString();

    const trip = await Trip.findById(tripId).session(session);
    if (!trip) {
      throw new InviteInvalidError();
    }

    const existingMembership = await TripMember.findOne({
      tripId,
      userId,
    }).session(session);

    if (existingMembership) {
      throw new AlreadyMemberError();
    }

    const claimed = await TripInvitation.findOneAndUpdate(
      {
        tokenHash,
        usedAt: null,
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      { $set: { usedAt: now, usedBy: userId } },
      { session, new: false },
    );

    if (!claimed) {
      throw new InviteInvalidError();
    }

    await TripMember.create(
      [
        {
          tripId,
          userId,
          role: claimed.role,
        },
      ],
      { session },
    );

    return tripId;
  });
}
