export const TRIP_DATE_CHANGE_ERROR_CODES = {
  generic: "generic",
  validationFailed: "validationFailed",
  noChange: "noChange",
  stalePreview: "stalePreview",
  invalidPreviewToken: "invalidPreviewToken",
} as const;

export type TripDateChangeErrorCode =
  (typeof TRIP_DATE_CHANGE_ERROR_CODES)[keyof typeof TRIP_DATE_CHANGE_ERROR_CODES];

export const TRIP_DATE_CHANGE_PREVIEW_VERSION = 1 as const;
