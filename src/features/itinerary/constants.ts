export const ACTIVITY_TITLE_MIN_LENGTH = 1;
export const ACTIVITY_TITLE_MAX_LENGTH = 120;
export const ACTIVITY_LOCATION_MAX_LENGTH = 200;
export const ACTIVITY_ADDRESS_MAX_LENGTH = 500;
export const ACTIVITY_CITY_MAX_LENGTH = 200;
export const ACTIVITY_COUNTRY_MAX_LENGTH = 100;
export const ACTIVITY_GOOGLE_MAPS_URL_MAX_LENGTH = 2000;
export const ACTIVITY_NOTES_MAX_LENGTH = 2000;

export const ACTIVITY_ERROR_CODES = {
  generic: "generic",
  created: "created",
  updated: "updated",
  deleted: "deleted",
  dateOutOfRange: "dateOutOfRange",
  notFound: "notFound",
  deleteConfirm: "deleteConfirm",
  discardConfirm: "discardConfirm",
  invalidCostData: "invalidCostData",
} as const;

export type ActivityErrorCode =
  (typeof ACTIVITY_ERROR_CODES)[keyof typeof ACTIVITY_ERROR_CODES];

/** @deprecated Use ACTIVITY_ERROR_CODES and translate in the UI layer. */
export const ACTIVITY_MESSAGES = {
  generic: "generic",
  created: "created",
  updated: "updated",
  deleted: "deleted",
  dateOutOfRange: "dateOutOfRange",
  notFound: "notFound",
  deleteConfirm: "deleteConfirm",
  discardConfirm: "discardConfirm",
  invalidCostData: "invalidCostData",
} as const;
