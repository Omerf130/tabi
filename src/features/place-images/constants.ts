import { PLACES_PHOTO_FIELD_MASK } from "@/features/places/constants";

export const PLACE_PHOTO_DETAILS_FIELD_MASK = PLACES_PHOTO_FIELD_MASK;

export const PLACE_PHOTO_MAX_HEIGHT_PX = 480;
export const PLACE_PHOTO_MAX_WIDTH_PX = 720;

/** Conservative: Google photo names must not be cross-request cached. */
export const PLACE_PHOTO_RESPONSE_CACHE_CONTROL = "private, no-store";

export const PLACE_PHOTO_MEDIA_RETRY_STATUSES = new Set([400, 404]);
