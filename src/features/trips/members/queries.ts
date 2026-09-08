import "server-only";

import { connectDb } from "@/lib/db/connect";
import { TripMember } from "@/models/TripMember";
import { User } from "@/models/User";
import type { TripMemberListItem } from "./owner-invariant";

export async function listTripMembers(
  tripId: string,
): Promise<TripMemberListItem[]> {
  await connectDb();

  const memberships = await TripMember.find({ tripId })
    .sort({ createdAt: 1 })
    .lean();

  if (memberships.length === 0) {
    return [];
  }

  const userIds = memberships.map((membership) => membership.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userById = new Map(users.map((user) => [user._id.toString(), user]));

  return memberships
    .map((membership) => {
      const user = userById.get(membership.userId.toString());
      if (!user) {
        return null;
      }
      return {
        membershipId: membership._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: membership.role,
        joinedAt: membership.createdAt.toISOString(),
      };
    })
    .filter((item): item is TripMemberListItem => item !== null);
}

export async function countTripOwners(tripId: string): Promise<number> {
  await connectDb();
  return TripMember.countDocuments({ tripId, role: "owner" });
}
