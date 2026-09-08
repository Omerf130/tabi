import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripInvitation } from "@/models/TripInvitation";
import { InviteNotFoundError } from "./errors";

export async function revokeTripInvitation(
  tripId: string,
  invitationId: string,
): Promise<void> {
  await connectDb();

  const now = new Date();
  const invitation = await TripInvitation.findOneAndUpdate(
    {
      _id: invitationId,
      tripId,
      usedAt: null,
      revokedAt: null,
      expiresAt: { $gt: now },
    },
    { $set: { revokedAt: now } },
    { new: false },
  );

  if (!invitation) {
    throw new InviteNotFoundError();
  }
}
