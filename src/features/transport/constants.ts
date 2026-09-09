import type { TransportType } from "./transport-types";
import { TRANSPORT_TYPE_SINGULAR_LABELS } from "./transport-types";

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

export const TRANSPORT_MESSAGES = {
  notFound: "קטע התחבורה לא נמצא",
  invalidEndpoint: "פרטי מיקום או שעה לא תקינים",
  invalidChronology: "שעת ההגעה חייבת להיות אחרי שעת היציאה",
  invalidTimezone: "אזור זמן לא נתמך",
  invalidType: "סוג תחבורה לא תקין",
  saveFailed: "לא ניתן לשמור את התחבורה",
  deleteFailed: "לא ניתן למחוק את התחבורה",
  deleteConfirm: "למחוק את קטע התחבורה?",
} as const;

export function buildTransportHref(tripId: string): string {
  return `/app/trips/${tripId}/transport`;
}

export function buildTransportDetailHref(tripId: string, transportId: string): string {
  return `/app/trips/${tripId}/transport/${transportId}`;
}

export function buildTransportNewHref(tripId: string, type: TransportType): string {
  const params = new URLSearchParams({ type });
  return `/app/trips/${tripId}/transport/new?${params.toString()}`;
}

export function buildTransportEditHref(tripId: string, transportId: string): string {
  return `/app/trips/${tripId}/transport/${transportId}/edit`;
}

export function getAddTransportTypeLabel(type: TransportType): string {
  return `הוספת ${TRANSPORT_TYPE_SINGULAR_LABELS[type]}`;
}
