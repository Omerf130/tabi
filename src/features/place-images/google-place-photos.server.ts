import "server-only";

import { PLACES_MESSAGES } from "@/features/places/constants";
import {
  GooglePlacesConfigError,
  GooglePlacesRequestError,
} from "@/features/places/googlePlaces.server";
import {
  PLACE_PHOTO_DETAILS_FIELD_MASK,
  PLACE_PHOTO_MAX_HEIGHT_PX,
  PLACE_PHOTO_MAX_WIDTH_PX,
} from "./constants";
import type { PlacePhotoAuthorAttribution, PlacePhotoMetadata } from "./types";

type GooglePhotoResponse = {
  photos?: Array<{
    name?: string;
    authorAttributions?: PlacePhotoAuthorAttribution[];
  }>;
};

function getGooglePlacesApiKey(): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    throw new GooglePlacesConfigError();
  }
  return apiKey;
}

function normalizeAuthorAttributions(
  attributions: PlacePhotoAuthorAttribution[] | undefined,
): PlacePhotoAuthorAttribution[] {
  if (!attributions?.length) {
    return [];
  }

  return attributions
    .map((entry) => ({
      displayName: entry.displayName?.trim() || undefined,
      uri: entry.uri?.trim() || undefined,
      photoUri: entry.photoUri?.trim() || undefined,
    }))
    .filter((entry) => entry.displayName || entry.uri || entry.photoUri);
}

/** Representative photo = photos[0] only. No caching across requests. */
export async function fetchPlacePhotoMetadata(
  googlePlaceId: string,
): Promise<PlacePhotoMetadata | null> {
  const apiKey = getGooglePlacesApiKey();
  const encodedPlaceId = encodeURIComponent(googlePlaceId);
  const url = new URL(
    `https://places.googleapis.com/v1/places/${encodedPlaceId}`,
  );

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACE_PHOTO_DETAILS_FIELD_MASK,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new GooglePlacesRequestError(PLACES_MESSAGES.resolveFailed);
  }

  const payload = (await response.json()) as GooglePhotoResponse;
  const primaryPhoto = payload.photos?.[0];
  const photoName = primaryPhoto?.name?.trim();
  if (!primaryPhoto || !photoName) {
    return null;
  }

  return {
    googlePlaceId,
    photoName,
    authorAttributions: normalizeAuthorAttributions(primaryPhoto.authorAttributions),
  };
}

export async function fetchPlacePhotoMedia(
  photoName: string,
  options: { maxHeightPx?: number; maxWidthPx?: number } = {},
): Promise<Response> {
  const apiKey = getGooglePlacesApiKey();
  const url = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  url.searchParams.set(
    "maxHeightPx",
    String(options.maxHeightPx ?? PLACE_PHOTO_MAX_HEIGHT_PX),
  );
  url.searchParams.set(
    "maxWidthPx",
    String(options.maxWidthPx ?? PLACE_PHOTO_MAX_WIDTH_PX),
  );
  url.searchParams.set("key", apiKey);

  return fetch(url, { cache: "no-store" });
}
