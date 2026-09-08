export const TRAVEL_DOCUMENT_TITLE_MIN_LENGTH = 1;
export const TRAVEL_DOCUMENT_TITLE_MAX_LENGTH = 120;
export const TRAVEL_DOCUMENT_DESCRIPTION_MAX_LENGTH = 500;
export const TRAVEL_DOCUMENT_ORIGINAL_FILENAME_MAX_LENGTH = 200;
export const TRAVEL_DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;

export const TRAVEL_DOCUMENT_CATEGORIES = [
  "flight",
  "accommodation",
  "train",
  "ticket",
  "insurance",
  "reservation",
  "transport",
  "other",
] as const;

export type TravelDocumentCategory = (typeof TRAVEL_DOCUMENT_CATEGORIES)[number];

export const TRAVEL_DOCUMENT_CATEGORY_LABELS: Record<
  TravelDocumentCategory,
  string
> = {
  flight: "טיסות",
  accommodation: "לינה",
  train: "רכבות",
  ticket: "כרטיסים",
  insurance: "ביטוח",
  reservation: "הזמנות",
  transport: "תחבורה",
  other: "אחר",
};

export const TRAVEL_DOCUMENT_FILTER_OPTIONS = [
  { value: "all", label: "הכל" },
  ...TRAVEL_DOCUMENT_CATEGORIES.map((category) => ({
    value: category,
    label: TRAVEL_DOCUMENT_CATEGORY_LABELS[category],
  })),
] as const;

export type TravelDocumentFilterValue =
  (typeof TRAVEL_DOCUMENT_FILTER_OPTIONS)[number]["value"];

export const TRAVEL_DOCUMENT_ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type TravelDocumentContentType =
  (typeof TRAVEL_DOCUMENT_ALLOWED_CONTENT_TYPES)[number];

export const TRAVEL_DOCUMENT_CONTENT_TYPE_LABELS: Record<
  TravelDocumentContentType,
  string
> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
};

export const TRAVEL_DOCUMENT_MESSAGES = {
  created: "המסמך נוסף",
  updated: "המסמך עודכן",
  replaced: "הקובץ הוחלף",
  deleted: "המסמך נמחק",
  generic: "לא ניתן לשמור את המסמך. נסו שוב.",
  notFound: "המסמך לא נמצא",
  missingFile: "יש לבחור קובץ",
  tooLarge: "הקובץ גדול מדי (עד 15MB)",
  invalidType: "סוג קובץ לא נתמך. PDF, JPEG, PNG או WebP בלבד",
  invalidLink: "קישור לא תקין למסמך",
  bothLinks: "ניתן לקשר מסמך לפעילות או לינה, לא לשניהם",
  deleteConfirm: "למחוק את המסמך?",
} as const;

export function getTravelDocumentFilePath(
  tripId: string,
  documentId: string,
): string {
  return `/app/trips/${tripId}/documents/${documentId}/file`;
}

export function getTravelDocumentDetailPath(
  tripId: string,
  documentId: string,
): string {
  return `/app/trips/${tripId}/documents/${documentId}`;
}

export function getTravelDocumentsSettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/settings#documents`;
}

export function isPdfContentType(contentType: string): boolean {
  return contentType === "application/pdf";
}

export function isImageContentType(contentType: string): boolean {
  return (
    contentType === "image/jpeg" ||
    contentType === "image/png" ||
    contentType === "image/webp"
  );
}
