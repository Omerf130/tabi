export const TRIP_NAME_MIN_LENGTH = 2;
export const TRIP_NAME_MAX_LENGTH = 80;
export const TRIP_DESCRIPTION_MAX_LENGTH = 300;

export const TRIP_CALENDAR_TIMEZONE = "Asia/Tokyo";

export const TRIP_MAX_DURATION_DAYS = 180;

export const TRIP_ERROR_CODES = {
  generic: "generic",
  name: "name",
  startDate: "startDate",
  endDate: "endDate",
  dateOrder: "dateOrder",
  maxDuration: "maxDuration",
} as const;

export type TripErrorCode = (typeof TRIP_ERROR_CODES)[keyof typeof TRIP_ERROR_CODES];
