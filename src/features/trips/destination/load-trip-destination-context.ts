import "server-only";

import type { TripDestinationDocument } from "@/models/Trip";
import { ensureTripDestinationTimeZone } from "./ensure-trip-destination-time-zone";
import {
  buildTripDestinationContext,
  type TripDestinationContext,
} from "./trip-destination-context";

export async function loadTripDestinationContext(input: {
  tripId: string;
  destination?: TripDestinationDocument | null;
}): Promise<TripDestinationContext> {
  const destinationTimeZone = await ensureTripDestinationTimeZone(
    input.tripId,
    input.destination ?? undefined,
  );

  const snapshot =
    input.destination &&
    typeof input.destination.latitude === "number" &&
    typeof input.destination.longitude === "number" &&
    input.destination.googlePlaceId &&
    input.destination.displayName
      ? {
          googlePlaceId: input.destination.googlePlaceId,
          displayName: input.destination.displayName,
          secondaryLabel: input.destination.secondaryLabel ?? undefined,
          country: input.destination.country ?? undefined,
          countryCode: input.destination.countryCode ?? undefined,
          latitude: input.destination.latitude,
          longitude: input.destination.longitude,
          timeZone: destinationTimeZone,
        }
      : null;

  return buildTripDestinationContext({
    tripId: input.tripId,
    destination: snapshot,
    destinationTimeZone,
  });
}
