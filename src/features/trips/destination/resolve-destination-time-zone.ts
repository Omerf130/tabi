import "server-only";

import {
  fetchIanaTimeZoneForCoordinates,
  GoogleTimeZoneConfigError,
  GoogleTimeZoneRequestError,
} from "@/features/places/google-time-zone.server";
import { FALLBACK_TRIP_CALENDAR_TIMEZONE } from "./constants";
import { isValidIanaTimeZone } from "./is-valid-iana-time-zone";

export type ResolveDestinationTimeZoneInput = {
  latitude: number;
  longitude: number;
  timestampSeconds?: number;
};

export type ResolveDestinationTimeZoneResult =
  | { ok: true; timeZone: string; usedFallback: false }
  | { ok: true; timeZone: string; usedFallback: true }
  | { ok: false; timeZone: typeof FALLBACK_TRIP_CALENDAR_TIMEZONE; usedFallback: true };

/**
 * Resolves a destination IANA timezone from coordinates via Google Time Zone API.
 * Never returns Asia/Tokyo implicitly — failures use explicit UTC fallback.
 */
export async function resolveDestinationTimeZone(
  input: ResolveDestinationTimeZoneInput,
): Promise<ResolveDestinationTimeZoneResult> {
  try {
    const resolved = await fetchIanaTimeZoneForCoordinates(input);
    if (resolved && isValidIanaTimeZone(resolved)) {
      return { ok: true, timeZone: resolved, usedFallback: false };
    }
    return {
      ok: false,
      timeZone: FALLBACK_TRIP_CALENDAR_TIMEZONE,
      usedFallback: true,
    };
  } catch (error) {
    if (
      error instanceof GoogleTimeZoneConfigError ||
      error instanceof GoogleTimeZoneRequestError
    ) {
      return {
        ok: false,
        timeZone: FALLBACK_TRIP_CALENDAR_TIMEZONE,
        usedFallback: true,
      };
    }
    throw error;
  }
}

export async function resolveDestinationTimeZoneOrFallback(
  input: ResolveDestinationTimeZoneInput,
): Promise<string> {
  const result = await resolveDestinationTimeZone(input);
  return result.timeZone;
}
