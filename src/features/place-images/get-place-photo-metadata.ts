import "server-only";

import { fetchPlacePhotoMetadata } from "./google-place-photos.server";
import {
  createPlacePhotoRequestContext,
  invalidatePlacePhotoMetadata,
  type PlacePhotoRequestContext,
} from "./request-dedupe";
import type { PlacePhotoMetadata } from "./types";

export async function getPlacePhotoMetadata(
  googlePlaceId: string,
  context: PlacePhotoRequestContext = createPlacePhotoRequestContext(),
): Promise<PlacePhotoMetadata | null> {
  const normalizedPlaceId = googlePlaceId.trim();
  if (!normalizedPlaceId) {
    return null;
  }

  const existing = context.metadataByPlaceId.get(normalizedPlaceId);
  if (existing) {
    return existing;
  }

  const pending = fetchPlacePhotoMetadata(normalizedPlaceId).catch(() => null);
  context.metadataByPlaceId.set(normalizedPlaceId, pending);
  return pending;
}

export async function getPlacePhotoMetadataFresh(
  googlePlaceId: string,
  context: PlacePhotoRequestContext,
): Promise<PlacePhotoMetadata | null> {
  invalidatePlacePhotoMetadata(context, googlePlaceId.trim());
  return getPlacePhotoMetadata(googlePlaceId, context);
}
