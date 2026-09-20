import type { TripDestinationSnapshot } from "@/features/places/resolve-destination-snapshot";

export type TripDestinationContext = {
  tripId: string;
  displayName?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  destinationTimeZone: string;
};

export function buildTripDestinationContext(input: {
  tripId: string;
  destination?: TripDestinationSnapshot | null;
  destinationTimeZone: string;
}): TripDestinationContext {
  const destination = input.destination ?? undefined;
  return {
    tripId: input.tripId,
    displayName: destination?.displayName,
    country: destination?.country,
    countryCode: destination?.countryCode,
    latitude: destination?.latitude,
    longitude: destination?.longitude,
    destinationTimeZone: input.destinationTimeZone,
  };
}
