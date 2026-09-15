import "server-only";

import { toPublicUser } from "@/features/auth/public-user";
import { connectDb } from "@/lib/db/connect";
import { User } from "@/models/User";

export type ProfileUserRecord = ReturnType<typeof toPublicUser> & {
  hasProfileImage: boolean;
};

export async function loadProfileUserRecord(
  userId: string,
): Promise<ProfileUserRecord | null> {
  await connectDb();
  const user = await User.findById(userId).lean();
  if (!user) {
    return null;
  }
  return {
    ...toPublicUser(user),
    hasProfileImage: Boolean(user.profileImage?.pathname?.trim()),
  };
}
