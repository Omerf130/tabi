import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Trip } from "@/models/Trip";
import type { TripDestinationDocument } from "@/models/Trip";
import { FALLBACK_TRIP_CALENDAR_TIMEZONE } from "./constants";
import { isValidIanaTimeZone, normalizeTripCalendarTimeZone } from "./is-valid-iana-time-zone";
import { resolveDestinationTimeZoneOrFallback } from "./resolve-destination-time-zone";

function readPersistedTimeZone(
  destination: TripDestinationDocument | undefined | null,
): string | null {
  const value = destination?.timeZone?.trim();
  if (value && isValidIanaTimeZone(value)) {
    return value;
  }
  return null;
}

function hasCoordinates(
  destination: TripDestinationDocument | undefined | null,
): destination is TripDestinationDocument & {
  latitude: number;
  longitude: number;
} {
  return (
    typeof destination?.latitude === "number" &&
    typeof destination?.longitude === "number"
  );
}

async function backfillAndPersistTimeZone(
  tripId: string,
  destination: TripDestinationDocument & {
    latitude: number;
    longitude: number;
  },
): Promise<string> {
  await connectDb();

  const resolved = await resolveDestinationTimeZoneOrFallback({
    latitude: destination.latitude,
    longitude: destination.longitude,
  });

  const updated = await Trip.findOneAndUpdate(
    {
      _id: tripId,
      $or: [
        { "destination.timeZone": { $exists: false } },
        { "destination.timeZone": null },
        { "destination.timeZone": "" },
      ],
    },
    { $set: { "destination.timeZone": resolved } },
    { new: true },
  ).lean();

  if (updated?.destination) {
    return readPersistedTimeZone(updated.destination) ?? resolved;
  }

  const reread = await Trip.findById(tripId).select("destination.timeZone").lean();
  return readPersistedTimeZone(reread?.destination ?? undefined) ?? resolved;
}

/**
 * Returns the trip calendar IANA timezone. Uses persisted value when valid.
 * Legacy trips with coordinates but no timeZone are backfilled once server-side.
 */
export async function ensureTripDestinationTimeZone(
  tripId: string,
  destination: TripDestinationDocument | undefined | null,
): Promise<string> {
  const persisted = readPersistedTimeZone(destination);
  if (persisted) {
    return persisted;
  }

  if (!hasCoordinates(destination)) {
    return FALLBACK_TRIP_CALENDAR_TIMEZONE;
  }

  return backfillAndPersistTimeZone(tripId, destination);
}

export function getTripCalendarTimeZoneFromDestination(
  destination: TripDestinationDocument | undefined | null,
): string {
  const persisted = readPersistedTimeZone(destination);
  if (persisted) {
    return persisted;
  }
  return normalizeTripCalendarTimeZone(undefined);
}
