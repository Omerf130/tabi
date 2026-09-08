import "server-only";

import { connectDb } from "@/lib/db/connect";
import { hashToken } from "@/lib/crypto/tokens";
import { Trip } from "@/models/Trip";
import { TripInvitation } from "@/models/TripInvitation";
import { TripMember } from "@/models/TripMember";
import {
  isInvitationValid,
  toInvitationListItem,
  toPublicInviteState,
  type InvitationListItem,
  type PublicInviteState,
} from "./public-invite";

export async function listTripInvitations(
  tripId: string,
): Promise<InvitationListItem[]> {
  await connectDb();
  const now = new Date();
  const invitations = await TripInvitation.find({ tripId })
    .sort({ createdAt: -1 })
    .lean();

  return invitations.map((invitation) =>
    toInvitationListItem(
      {
        _id: invitation._id,
        role: invitation.role,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        usedAt: invitation.usedAt ?? null,
        revokedAt: invitation.revokedAt ?? null,
      },
      now,
    ),
  );
}

export async function getPublicInviteState(
  rawToken: string,
  userId?: string,
): Promise<PublicInviteState> {
  await connectDb();

  const tokenHash = hashToken(rawToken);
  const now = new Date();

  const invitation = await TripInvitation.findOne({ tokenHash }).lean();
  if (!invitation || !isInvitationValid(invitation, now)) {
    return toPublicInviteState({ status: "invalid" });
  }

  const trip = await Trip.findById(invitation.tripId).lean();
  if (!trip) {
    return toPublicInviteState({ status: "invalid" });
  }

  if (userId) {
    const membership = await TripMember.findOne({
      tripId: invitation.tripId,
      userId,
    }).lean();

    if (membership) {
      return toPublicInviteState({
        status: "already_member",
        tripName: trip.name,
        tripId: trip._id.toString(),
      });
    }
  }

  return toPublicInviteState({
    status: "valid",
    tripName: trip.name,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
  });
}
