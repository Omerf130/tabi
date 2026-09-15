import { buildUserProfileImageHref } from "@/features/account/profile-image/constants";
import type { InvitationListItem } from "@/features/trips/invitations/public-invite";
import type { TripMemberListItem } from "@/features/trips/members/owner-invariant";
import type { TripMemberRole } from "@/models/TripMember";

export type TravelerSettingsRow = {
  membershipId: string;
  userId: string;
  name: string;
  role: TripMemberRole;
  joinedAt: string;
  isCurrentUser: boolean;
  avatarHref?: string;
  /** Present only in owner-facing payloads. */
  email?: string;
};

function avatarHrefForMember(member: TripMemberListItem): string | undefined {
  if (!member.hasProfileImage) {
    return undefined;
  }
  return buildUserProfileImageHref(member.userId);
}

export type TravelersSettingsOwnerViewModel = {
  tripId: string;
  isOwner: true;
  currentUserId: string;
  ownerCount: number;
  travelers: TravelerSettingsRow[];
  activeInvitations: InvitationListItem[];
};

export type TravelersSettingsMemberViewModel = {
  tripId: string;
  isOwner: false;
  currentUserId: string;
  travelers: TravelerSettingsRow[];
};

export type TravelersSettingsViewModel =
  | TravelersSettingsOwnerViewModel
  | TravelersSettingsMemberViewModel;

export function buildTravelersSettingsViewModel(input: {
  tripId: string;
  isOwner: boolean;
  currentUserId: string;
  members: readonly TripMemberListItem[];
  activeInvitations?: readonly InvitationListItem[];
}): TravelersSettingsViewModel {
  const ownerCount = input.members.filter((m) => m.role === "owner").length;

  if (input.isOwner) {
    return {
      tripId: input.tripId,
      isOwner: true,
      currentUserId: input.currentUserId,
      ownerCount,
      activeInvitations: [...(input.activeInvitations ?? [])],
      travelers: input.members.map((member) => ({
        membershipId: member.membershipId,
        userId: member.userId,
        name: member.name,
        role: member.role,
        joinedAt: member.joinedAt,
        isCurrentUser: member.userId === input.currentUserId,
        avatarHref: avatarHrefForMember(member),
        email: member.email,
      })),
    };
  }

  return {
    tripId: input.tripId,
    isOwner: false,
    currentUserId: input.currentUserId,
    travelers: input.members.map((member) => ({
      membershipId: member.membershipId,
      userId: member.userId,
      name: member.name,
      role: member.role,
      joinedAt: member.joinedAt,
      isCurrentUser: member.userId === input.currentUserId,
      avatarHref: avatarHrefForMember(member),
    })),
  };
}

/** Ensures member-facing serialized payloads never include email fields. */
export function assertMemberTravelersPayloadHasNoEmails(
  model: TravelersSettingsMemberViewModel,
): void {
  for (const traveler of model.travelers) {
    if ("email" in traveler && traveler.email !== undefined) {
      throw new Error("Member travelers payload must not include email");
    }
  }
}
