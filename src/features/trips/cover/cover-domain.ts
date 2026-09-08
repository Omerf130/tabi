import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import type { TripCoverImage } from "@/features/trips/public-trip";
import {
  deleteTripCoverBlob,
  uploadTripCoverBlob,
  type StoredTripCover,
} from "./blob-storage";

export async function setTripCoverImage(
  tripId: string,
  cover: StoredTripCover,
): Promise<TripCoverImage> {
  await connectDb();
  const updated = await Trip.findByIdAndUpdate(
    tripId,
    {
      coverImage: {
        pathname: cover.pathname,
        url: cover.url,
        contentType: cover.contentType,
      },
    },
    { new: true },
  ).lean();

  if (!updated?.coverImage) {
    throw new Error("Failed to persist trip cover");
  }

  return {
    pathname: updated.coverImage.pathname,
    contentType: updated.coverImage.contentType,
  };
}

export async function clearTripCoverImage(tripId: string): Promise<TripCoverImage | null> {
  await connectDb();
  const existing = await Trip.findById(tripId).lean();
  const previous = existing?.coverImage
    ? {
        pathname: existing.coverImage.pathname,
        contentType: existing.coverImage.contentType,
      }
    : null;

  await Trip.findByIdAndUpdate(tripId, { $unset: { coverImage: 1 } });
  return previous;
}

export async function replaceTripCoverImage(
  tripId: string,
  body: Buffer,
  contentType: string,
): Promise<{ cover: TripCoverImage; previousPathname: string | null }> {
  await connectDb();
  const existing = await Trip.findById(tripId).lean();
  const previousPathname = existing?.coverImage?.pathname ?? null;
  const uploaded = await uploadTripCoverBlob(tripId, body, contentType);

  try {
    const cover = await setTripCoverImage(tripId, uploaded);
    return { cover, previousPathname };
  } catch (error) {
    await deleteTripCoverBlob(uploaded.pathname);
    throw error;
  }
}

export async function removeTripCoverImage(
  tripId: string,
): Promise<string | null> {
  const previous = await clearTripCoverImage(tripId);
  if (!previous) {
    return null;
  }

  await deleteTripCoverBlob(previous.pathname);
  return previous.pathname;
}

export async function cleanupTripCoverPathname(pathname: string): Promise<void> {
  await deleteTripCoverBlob(pathname);
}
