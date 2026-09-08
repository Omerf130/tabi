import "server-only";

import { del, get, put } from "@vercel/blob";

export type StoredTravelDocumentBlob = {
  pathname: string;
  contentType: string;
};

export async function uploadTravelDocumentBlob(
  tripId: string,
  documentId: string,
  body: Buffer,
  contentType: string,
): Promise<StoredTravelDocumentBlob> {
  const blob = await put(`trips/${tripId}/documents/${documentId}`, body, {
    access: "private",
    contentType,
    addRandomSuffix: true,
  });

  return {
    pathname: blob.pathname,
    contentType,
  };
}

export async function deleteTravelDocumentBlob(pathname: string): Promise<void> {
  await del(pathname);
}

export async function readTravelDocumentBlob(pathname: string): Promise<{
  stream: ReadableStream;
  contentType: string;
}> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error("Travel document blob not found");
  }

  return {
    stream: result.stream,
    contentType: result.blob.contentType ?? "application/octet-stream",
  };
}
