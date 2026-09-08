import "server-only";

import { del, get, put } from "@vercel/blob";

export type StoredTripCover = {
  pathname: string;
  url: string;
  contentType: string;
};

export async function uploadTripCoverBlob(
  tripId: string,
  body: Buffer,
  contentType: string,
): Promise<StoredTripCover> {
  const blob = await put(`trips/${tripId}/cover`, body, {
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

export async function deleteTripCoverBlob(pathname: string): Promise<void> {
  await del(pathname);
}

export async function readTripCoverBlob(pathname: string): Promise<{
  stream: ReadableStream;
  contentType: string;
}> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Trip cover blob not found");
  }

  return {
    stream: result.stream,
    contentType: result.blob.contentType ?? "application/octet-stream",
  };
}
