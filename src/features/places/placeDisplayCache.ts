import "server-only";

import type { PlaceDisplaySnapshot } from "./types";
import { PLACES_DISPLAY_CACHE_TTL_MS } from "./constants";

type CacheEntry = {
  snapshot: PlaceDisplaySnapshot;
  expiresAt: number;
};

const displayCache = new Map<string, CacheEntry>();

function cacheKey(placeId: string, languageCode: string): string {
  return `${placeId}:${languageCode}`;
}

export function getCachedPlaceDisplay(
  placeId: string,
  languageCode: string,
): PlaceDisplaySnapshot | null {
  const entry = displayCache.get(cacheKey(placeId, languageCode));
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    displayCache.delete(cacheKey(placeId, languageCode));
    return null;
  }

  return entry.snapshot;
}

export function setCachedPlaceDisplay(
  placeId: string,
  languageCode: string,
  snapshot: PlaceDisplaySnapshot,
): void {
  displayCache.set(cacheKey(placeId, languageCode), {
    snapshot,
    expiresAt: Date.now() + PLACES_DISPLAY_CACHE_TTL_MS,
  });
}

export function clearPlaceDisplayCacheForTests(): void {
  displayCache.clear();
}
