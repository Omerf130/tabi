import type { TripWorkspace } from "@/features/trips/public-trip";
import type { TripDestinationContext } from "./trip-destination-context";

/** Structured trip destination fields used for itinerary day weather resolution. */
export type DayWeatherTripDestination = {
  country?: string;
  countryCode?: string;
  displayName?: string;
  latitude?: number;
  longitude?: number;
};

export function dayWeatherTripDestinationFromWorkspace(
  trip: Pick<TripWorkspace, "destination">,
): DayWeatherTripDestination | undefined {
  const destination = trip.destination;
  if (!destination) {
    return undefined;
  }
  return {
    country: destination.country,
    countryCode: destination.countryCode,
    displayName: destination.displayName,
    latitude: destination.latitude,
    longitude: destination.longitude,
  };
}

export function dayWeatherTripDestinationFromContext(
  context: TripDestinationContext,
): DayWeatherTripDestination {
  return {
    country: context.country,
    countryCode: context.countryCode,
    displayName: context.displayName,
    latitude: context.latitude,
    longitude: context.longitude,
  };
}
