import "server-only";

import { del, get, put } from "@vercel/blob";

export type StoredProfileImage = {
  pathname: string;
  url: string;
  contentType: string;
};

export async function uploadUserProfileImageBlob(
  userId: string,
  body: Buffer,
  contentType: string,
): Promise<StoredProfileImage> {
  const blob = await put(`users/${userId}/profile`, body, {
    access: "private",
    contentType,
    addRandomSuffix: true,
  });

  return {
    pathname: blob.pathname,
    url: blob.url,
    contentType,
  };
}

export async function deleteUserProfileImageBlob(pathname: string): Promise<void> {
  await del(pathname);
}

export async function readUserProfileImageBlob(pathname: string): Promise<{
  stream: ReadableStream;
  contentType: string;
}> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Profile image blob not found");
  }

  return {
    stream: result.stream,
    contentType: result.blob.contentType ?? "application/octet-stream",
  };
}
