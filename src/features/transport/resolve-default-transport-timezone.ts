import {
  isSupportedTransportTimezone,
  TRANSPORT_TIMEZONE_OPTIONS,
} from "./timezone-options";

/** Trip-scoped transport endpoint default — never Asia/Tokyo unless that is the trip calendar zone. */
export function resolveDefaultTransportTimezone(
  destinationCalendarTimeZone: string,
  options = TRANSPORT_TIMEZONE_OPTIONS,
): string {
  const trimmed = destinationCalendarTimeZone.trim();
  if (trimmed && isSupportedTransportTimezone(trimmed, options)) {
    return trimmed;
  }
  return "UTC";
}
