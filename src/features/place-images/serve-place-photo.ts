import "server-only";

import {
  PLACES_RATE_LIMIT_MAX_REQUESTS,
  PLACES_RATE_LIMIT_WINDOW_MS,
} from "@/features/places/constants";
import { GooglePlacesConfigError } from "@/features/places/googlePlaces.server";
import { checkPlacesRateLimit } from "@/features/places/rateLimit";
import {
  PLACE_PHOTO_MEDIA_RETRY_STATUSES,
  PLACE_PHOTO_RESPONSE_CACHE_CONTROL,
} from "./constants";
import { fetchPlacePhotoMedia } from "./google-place-photos.server";
import {
  getPlacePhotoMetadata,
  getPlacePhotoMetadataFresh,
} from "./get-place-photo-metadata";
import {
  createPlacePhotoRequestContext,
  type PlacePhotoRequestContext,
} from "./request-dedupe";

export async function servePlacePhotoResponse(input: {
  googlePlaceId: string;
  userId: string;
  context?: PlacePhotoRequestContext;
}): Promise<Response> {
  if (
    !checkPlacesRateLimit(
      input.userId,
      PLACES_RATE_LIMIT_WINDOW_MS,
      PLACES_RATE_LIMIT_MAX_REQUESTS,
    )
  ) {
    return new Response(null, { status: 429 });
  }

  const context = input.context ?? createPlacePhotoRequestContext();

  try {
    const metadata = await getPlacePhotoMetadata(input.googlePlaceId, context);
    if (!metadata) {
      return new Response(null, { status: 404 });
    }

    let mediaResponse = await fetchPlacePhotoMedia(metadata.photoName);

    if (
      !mediaResponse.ok &&
      PLACE_PHOTO_MEDIA_RETRY_STATUSES.has(mediaResponse.status)
    ) {
      const freshMetadata = await getPlacePhotoMetadataFresh(
        input.googlePlaceId,
        context,
      );
      if (freshMetadata?.photoName && freshMetadata.photoName !== metadata.photoName) {
        mediaResponse = await fetchPlacePhotoMedia(freshMetadata.photoName);
      }
    }

    if (mediaResponse.status === 429) {
      return new Response(null, { status: 429 });
    }

    if (!mediaResponse.ok) {
      return new Response(null, { status: 404 });
    }

    const bytes = await mediaResponse.arrayBuffer();

    return new Response(bytes, {
      headers: {
        "Content-Type": mediaResponse.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": PLACE_PHOTO_RESPONSE_CACHE_CONTROL,
      },
    });
  } catch (error) {
    if (error instanceof GooglePlacesConfigError) {
      return new Response(null, { status: 503 });
    }
    return new Response(null, { status: 404 });
  }
}
