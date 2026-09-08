import type { TripMemberRole } from "@/models/TripMember";

export type TripMemberListItem = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: TripMemberRole;
  joinedAt: string;
};

export function canRemoveOrDemoteOwner(
  owners: readonly { id: string }[],
  targetMembershipId: string,
): boolean {
  return owners.some((owner) => owner.id !== targetMembershipId);
}

export function wouldLeaveZeroOwners(
  ownerCount: number,
  targetIsOwner: boolean,
): boolean {
  return targetIsOwner && ownerCount <= 1;
}
