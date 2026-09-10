export const ACCOMMODATION_NAME_MAX_LENGTH = 120;
export const ACCOMMODATION_NAME_JAPANESE_MAX_LENGTH = 200;
export const ACCOMMODATION_CITY_MAX_LENGTH = 100;
export const ACCOMMODATION_ADDRESS_MAX_LENGTH = 500;
export const ACCOMMODATION_BOOKING_REFERENCE_MAX_LENGTH = 100;
export const ACCOMMODATION_NOTES_MAX_LENGTH = 2000;
export const ACCOMMODATION_GOOGLE_MAPS_URL_MAX_LENGTH = 2000;

export const ACCOMMODATION_PLACE_ID_MAX_LENGTH = 512;

export const ACCOMMODATION_MESSAGES = {
  created: "מקום הלינה נוסף",
  updated: "מקום הלינה עודכן",
  deleted: "מקום הלינה נמחק",
  generic: "לא ניתן לשמור את מקום הלינה. נסו שוב.",
  notFound: "מקום הלינה לא נמצא",
  dateOutOfRange: "תאריכי Check-in ו-Check-out חייבים להיות בתוך טווח הטיול",
  invalidDateRange: "תאריך Check-out חייב להיות אחרי תאריך Check-in (לפחות לילה אחד)",
  deleteConfirm: "למחוק את מקום הלינה הזה מהטיול?",
  deleteConfirmDetail:
    "פעולה זו מסירה את מקום הלינה מ-Tabi בלבד — היא לא מבטלת את ההזמנה בבית המלון.",
} as const;

export function formatAccommodationDeleteConfirm(): string {
  return `${ACCOMMODATION_MESSAGES.deleteConfirm}\n\n${ACCOMMODATION_MESSAGES.deleteConfirmDetail}`;
}

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

export function buildAccommodationPhotoHref(
  tripId: string,
  accommodationId: string,
): string {
  return `/app/trips/${tripId}/accommodations/${accommodationId}/photo`;
}
