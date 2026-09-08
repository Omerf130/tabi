import "server-only";

import type { TripInvitationRole } from "@/models/TripInvitation";
import type { TripMemberRole } from "@/models/TripMember";

export type PublicInviteState =
  | {
      status: "valid";
      tripName: string;
      role: TripMemberRole;
      expiresAt: string;
    }
  | {
      status: "already_member";
      tripName: string;
      tripId: string;
    }
  | {
      status: "invalid";
    };

export type InvitationListItem = {
  id: string;
  role: TripInvitationRole;
  createdAt: string;
  expiresAt: string;
  status: "active" | "used" | "expired" | "revoked";
};

export function getInvitationStatus(
  invitation: {
    usedAt?: Date | null;
    revokedAt?: Date | null;
    expiresAt: Date;
  },
  now: Date = new Date(),
): InvitationListItem["status"] {
  if (invitation.usedAt) {
    return "used";
  }
  if (invitation.revokedAt) {
    return "revoked";
  }
  if (invitation.expiresAt <= now) {
    return "expired";
  }
  return "active";
}

export function toPublicInviteState(
  input:
    | { status: "invalid" }
    | {
        status: "valid";
        tripName: string;
        role: TripMemberRole;
        expiresAt: Date;
      }
    | {
        status: "already_member";
        tripName: string;
        tripId: string;
      },
): PublicInviteState {
  if (input.status === "invalid") {
    return { status: "invalid" };
  }
  if (input.status === "already_member") {
    return {
      status: "already_member",
      tripName: input.tripName,
      tripId: input.tripId,
    };
  }
  return {
    status: "valid",
    tripName: input.tripName,
    role: input.role,
    expiresAt: input.expiresAt.toISOString(),
  };
}

export function toInvitationListItem(
  invitation: {
    _id: { toString(): string };
    role: TripInvitationRole;
    createdAt: Date;
    expiresAt: Date;
    usedAt: Date | null;
    revokedAt: Date | null;
  },
  now: Date = new Date(),
): InvitationListItem {
  return {
    id: invitation._id.toString(),
    role: invitation.role,
    createdAt: invitation.createdAt.toISOString(),
    expiresAt: invitation.expiresAt.toISOString(),
    status: getInvitationStatus(invitation, now),
  };
}

export function isInvitationValid(
  invitation: {
    usedAt?: Date | null;
    revokedAt?: Date | null;
    expiresAt: Date;
  },
  now: Date = new Date(),
): boolean {
  return (
    !invitation.usedAt &&
    !invitation.revokedAt &&
    invitation.expiresAt > now
  );
}
