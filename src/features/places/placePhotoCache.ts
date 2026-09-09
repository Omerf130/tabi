import "server-only";

import { PLACES_DISPLAY_CACHE_TTL_MS } from "./constants";

type PhotoCacheEntry = {
  photoName: string | null;
  expiresAt: number;
};

const photoCache = new Map<string, PhotoCacheEntry>();

export function getCachedPlacePhotoName(placeId: string): string | null | undefined {
  const entry = photoCache.get(placeId);
  if (!entry) {
    return undefined;
  }

  if (Date.now() > entry.expiresAt) {
    photoCache.delete(placeId);
    return undefined;
  }

  return entry.photoName;
}

export function setCachedPlacePhotoName(
  placeId: string,
  photoName: string | null,
): void {
  photoCache.set(placeId, {
    photoName,
    expiresAt: Date.now() + PLACES_DISPLAY_CACHE_TTL_MS,
  });
}

export function clearPlacePhotoCacheForTests(): void {
  photoCache.clear();
}
