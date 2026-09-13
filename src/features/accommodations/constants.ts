export const ACCOMMODATION_NAME_MAX_LENGTH = 120;
export const ACCOMMODATION_NAME_JAPANESE_MAX_LENGTH = 200;
export const ACCOMMODATION_CITY_MAX_LENGTH = 100;
export const ACCOMMODATION_ADDRESS_MAX_LENGTH = 500;
export const ACCOMMODATION_BOOKING_REFERENCE_MAX_LENGTH = 100;
export const ACCOMMODATION_NOTES_MAX_LENGTH = 2000;
export const ACCOMMODATION_GOOGLE_MAPS_URL_MAX_LENGTH = 2000;

export const ACCOMMODATION_PLACE_ID_MAX_LENGTH = 512;

export const ACCOMMODATION_ERROR_CODES = {
  generic: "generic",
  notFound: "notFound",
  dateOutOfRange: "dateOutOfRange",
  invalidDateRange: "invalidDateRange",
  invalidCostData: "invalidCostData",
} as const;

export type AccommodationErrorCode =
  (typeof ACCOMMODATION_ERROR_CODES)[keyof typeof ACCOMMODATION_ERROR_CODES];

export const ACCOMMODATION_SUCCESS_CODES = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
} as const;

export type AccommodationSuccessCode =
  (typeof ACCOMMODATION_SUCCESS_CODES)[keyof typeof ACCOMMODATION_SUCCESS_CODES];

export function getAccommodationsSettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/accommodations`;
}

export function buildAccommodationListHref(tripId: string): string {
  return `/app/trips/${tripId}/accommodations`;
}

export function buildAccommodationDetailHref(
  tripId: string,
  accommodationId: string,
): string {
  return `/app/trips/${tripId}/accommodations/${accommodationId}`;
}

export function buildAccommodationTaxiHref(
  tripId: string,
  accommodationId: string,
): string {
  return `/app/trips/${tripId}/accommodations/${accommodationId}/taxi`;
}

export { buildAccommodationPhotoHref } from "@/features/place-images/build-place-photo-href";
