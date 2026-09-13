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

export const TRAVEL_DOCUMENT_FILTER_VALUES = [
  "all",
  ...TRAVEL_DOCUMENT_CATEGORIES,
] as const;

export type TravelDocumentFilterValue =
  (typeof TRAVEL_DOCUMENT_FILTER_VALUES)[number];

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

export const TRAVEL_DOCUMENT_ERROR_CODES = {
  generic: "generic",
  notFound: "notFound",
  missingFile: "missingFile",
  tooLarge: "tooLarge",
  invalidType: "invalidType",
  invalidLink: "invalidLink",
  bothLinks: "bothLinks",
} as const;

export type TravelDocumentErrorCode =
  (typeof TRAVEL_DOCUMENT_ERROR_CODES)[keyof typeof TRAVEL_DOCUMENT_ERROR_CODES];

export const TRAVEL_DOCUMENT_SUCCESS_CODES = {
  created: "created",
  updated: "updated",
  replaced: "replaced",
  deleted: "deleted",
} as const;

export type TravelDocumentSuccessCode =
  (typeof TRAVEL_DOCUMENT_SUCCESS_CODES)[keyof typeof TRAVEL_DOCUMENT_SUCCESS_CODES];

export function getTravelDocumentFilePath(
  tripId: string,
  documentId: string,
): string {
  return `/app/trips/${tripId}/documents/${documentId}/file`;
}

export function buildTravelDocumentsHref(tripId: string): string {
  return `/app/trips/${tripId}/documents`;
}

export function getTravelDocumentDetailPath(
  tripId: string,
  documentId: string,
): string {
  return `/app/trips/${tripId}/documents/${documentId}`;
}

export function getTravelDocumentsSettingsHref(tripId: string): string {
  return `/app/trips/${tripId}/manage/documents`;
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
