import type { PlacePhotoMetadata } from "./types";

export type PlacePhotoRequestContext = {
  metadataByPlaceId: Map<string, Promise<PlacePhotoMetadata | null>>;
};

export function createPlacePhotoRequestContext(): PlacePhotoRequestContext {
  return {
    metadataByPlaceId: new Map(),
  };
}

export function invalidatePlacePhotoMetadata(
  context: PlacePhotoRequestContext,
  googlePlaceId: string,
): void {
  context.metadataByPlaceId.delete(googlePlaceId);
}
