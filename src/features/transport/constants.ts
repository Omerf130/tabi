import type { TransportType } from "./transport-types";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { createTransportTypeSingularLabelResolver } from "./transport-types";

export const TRANSPORT_LOCATION_NAME_MAX_LENGTH = 200;
export const TRANSPORT_LOCATION_CODE_MAX_LENGTH = 20;
export const TRANSPORT_BOOKING_REFERENCE_MAX_LENGTH = 80;
export const TRANSPORT_NOTES_MAX_LENGTH = 2000;
export const TRANSPORT_AIRLINE_MAX_LENGTH = 80;
export const TRANSPORT_FLIGHT_NUMBER_MAX_LENGTH = 20;
export const TRANSPORT_TERMINAL_MAX_LENGTH = 40;
export const TRANSPORT_GATE_MAX_LENGTH = 20;
export const TRANSPORT_SEAT_MAX_LENGTH = 80;
export const TRANSPORT_SERVICE_NAME_MAX_LENGTH = 80;
export const TRANSPORT_TRAIN_NUMBER_MAX_LENGTH = 40;
export const TRANSPORT_CAR_NUMBER_MAX_LENGTH = 20;
export const TRANSPORT_OPERATOR_MAX_LENGTH = 120;
export const TRANSPORT_SERVICE_NUMBER_MAX_LENGTH = 40;
export const TRANSPORT_VEHICLE_NOTES_MAX_LENGTH = 200;

export const DEFAULT_JAPAN_TRANSPORT_TIMEZONE = "Asia/Tokyo";

export const TRANSPORT_ERROR_CODES = {
  notFound: "notFound",
  invalidEndpoint: "invalidEndpoint",
  invalidChronology: "invalidChronology",
  invalidTimezone: "invalidTimezone",
  invalidType: "invalidType",
  saveFailed: "saveFailed",
  invalidCostData: "invalidCostData",
  deleteFailed: "deleteFailed",
} as const;

export type TransportErrorCode =
  (typeof TRANSPORT_ERROR_CODES)[keyof typeof TRANSPORT_ERROR_CODES];

export const TRANSPORT_SUCCESS_CODES = {
  saved: "saved",
  updated: "updated",
  deleted: "deleted",
} as const;

export type TransportSuccessCode =
  (typeof TRANSPORT_SUCCESS_CODES)[keyof typeof TRANSPORT_SUCCESS_CODES];

export function buildTransportHref(tripId: string): string {
  return `/app/trips/${tripId}/transport`;
}

export function buildTransportDetailHref(tripId: string, transportId: string): string {
  return `/app/trips/${tripId}/transport/${transportId}`;
}

export function buildTransportNewHref(
  tripId: string,
  type: TransportType,
  options?: {
    departureDate?: string;
    fromDay?: string;
  },
): string {
  const params = new URLSearchParams({ type });
  if (options?.departureDate) {
    params.set("departureDate", options.departureDate);
  }
  if (options?.fromDay) {
    params.set("fromDay", options.fromDay);
  }
  return `/app/trips/${tripId}/transport/new?${params.toString()}`;
}

export function buildTransportEditHref(tripId: string, transportId: string): string {
  return `/app/trips/${tripId}/transport/${transportId}/edit`;
}

export function getAddTransportTypeLabel(
  type: TransportType,
  t: AppTranslator<"Transport">,
): string {
  const singular = createTransportTypeSingularLabelResolver(t)(type);
  return t("addType", { type: singular });
}
