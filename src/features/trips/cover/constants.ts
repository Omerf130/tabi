export const TRIP_COVER_MAX_BYTES = 5 * 1024 * 1024;

export const TRIP_COVER_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type TripCoverContentType = (typeof TRIP_COVER_ALLOWED_CONTENT_TYPES)[number];

export const TRIP_COVER_ERROR_CODES = {
  generic: "generic",
  invalidType: "invalidType",
  tooLarge: "tooLarge",
  missingFile: "missingFile",
} as const;

export type TripCoverErrorCode =
  (typeof TRIP_COVER_ERROR_CODES)[keyof typeof TRIP_COVER_ERROR_CODES];

export const TRIP_COVER_SUCCESS_CODES = {
  removed: "removed",
  uploaded: "uploaded",
} as const;

export type TripCoverSuccessCode =
  (typeof TRIP_COVER_SUCCESS_CODES)[keyof typeof TRIP_COVER_SUCCESS_CODES];

export function getTripCoverPath(tripId: string): string {
  return `/app/trips/${tripId}/cover`;
}
