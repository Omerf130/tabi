import "server-only";

import { connectDb } from "@/lib/db/connect";
import { generateSecureToken, hashToken } from "@/lib/crypto/tokens";
import { TripInvitation } from "@/models/TripInvitation";
import type { TripInvitationRole } from "@/models/TripInvitation";
import { INVITE_EXPIRY_DAYS } from "./constants";
import { buildInviteUrl } from "./token";

function inviteExpiresAt(now: Date = new Date()): Date {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
  return expiresAt;
}

export async function createTripInvitation(
  tripId: string,
  createdBy: string,
  role: TripInvitationRole,
  origin?: string,
): Promise<{ inviteUrl: string; rawToken: string }> {
  await connectDb();

  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);

  await TripInvitation.create({
    tripId,
    tokenHash,
    role,
    createdBy,
    expiresAt: inviteExpiresAt(),
  });

  return {
    inviteUrl: buildInviteUrl(rawToken, origin),
    rawToken,
  };
}
