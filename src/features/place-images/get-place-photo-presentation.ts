import "server-only";

import { getPlacePhotoMetadata } from "./get-place-photo-metadata";
import {
  createPlacePhotoRequestContext,
  type PlacePhotoRequestContext,
} from "./request-dedupe";
import type { PlacePhotoPresentation } from "./types";

export async function getPlacePhotoPresentation(input: {
  googlePlaceId: string;
  photoHref: string;
  context?: PlacePhotoRequestContext;
}): Promise<PlacePhotoPresentation> {
  const context = input.context ?? createPlacePhotoRequestContext();
  const metadata = await getPlacePhotoMetadata(input.googlePlaceId, context);

  if (!metadata) {
    return {
      hasPhoto: false,
      authorAttributions: [],
    };
  }

  return {
    hasPhoto: true,
    photoHref: input.photoHref,
    authorAttributions: metadata.authorAttributions,
  };
}
