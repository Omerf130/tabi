import "server-only";

import { connectDb } from "@/lib/db/connect";
import { User } from "@/models/User";
import {
  deleteUserProfileImageBlob,
  uploadUserProfileImageBlob,
  type StoredProfileImage,
} from "./blob-storage";

export type UserProfileImage = {
  pathname: string;
  url: string;
  contentType: string;
};

export async function replaceUserProfileImage(
  userId: string,
  body: Buffer,
  contentType: string,
): Promise<{ image: UserProfileImage; previousPathname: string | null }> {
  await connectDb();
  const existing = await User.findById(userId).lean();
  const previousPathname = existing?.profileImage?.pathname ?? null;

  const stored = await uploadUserProfileImageBlob(userId, body, contentType);
  const image = toUserProfileImage(stored);

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        profileImage: image,
      },
    },
    { new: true },
  ).lean();

  if (!updated?.profileImage?.pathname) {
    throw new Error("Failed to persist profile image");
  }

  return { image, previousPathname };
}

export async function clearUserProfileImage(
  userId: string,
): Promise<string | null> {
  await connectDb();
  const existing = await User.findById(userId).lean();
  const previousPathname = existing?.profileImage?.pathname ?? null;

  await User.findByIdAndUpdate(userId, { $unset: { profileImage: 1 } });
  return previousPathname;
}

export async function cleanupProfileImagePathname(
  pathname: string | null | undefined,
): Promise<void> {
  if (!pathname?.trim()) {
    return;
  }
  try {
    await deleteUserProfileImageBlob(pathname);
  } catch {
    console.error("Failed to delete profile image blob");
  }
}

function toUserProfileImage(stored: StoredProfileImage): UserProfileImage {
  return {
    pathname: stored.pathname,
    url: stored.url,
    contentType: stored.contentType,
  };
}
