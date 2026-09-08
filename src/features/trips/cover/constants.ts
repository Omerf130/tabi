export const TRIP_COVER_MAX_BYTES = 5 * 1024 * 1024;

export const TRIP_COVER_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type TripCoverContentType = (typeof TRIP_COVER_ALLOWED_CONTENT_TYPES)[number];

export const TRIP_COVER_MESSAGES = {
  generic: "לא הצלחנו לעדכן את תמונת הטיול. נסו שוב.",
  invalidType: "יש להעלות קובץ JPEG, PNG או WebP בלבד.",
  tooLarge: "גודל הקובץ חורג מהמגבלה (5MB).",
  missingFile: "לא נבחר קובץ.",
  removed: "תמונת הטיול הוסרה.",
  uploaded: "תמונת הטיול עודכנה.",
} as const;

export function getTripCoverPath(tripId: string): string {
  return `/app/trips/${tripId}/cover`;
}
