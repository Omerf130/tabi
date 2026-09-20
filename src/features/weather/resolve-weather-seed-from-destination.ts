import type { TripDestinationContext } from "@/features/trips/destination/trip-destination-context";
import type { WeatherLocationRef } from "./types";

/** Initial weather location from persisted trip destination coordinates — never Tokyo fallback. */
export function resolveWeatherSeedFromDestination(
  destination: Pick<
    TripDestinationContext,
    "displayName" | "country" | "latitude" | "longitude"
  >,
): WeatherLocationRef | null {
  const { latitude, longitude, displayName, country } = destination;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const label = displayName?.trim() || country?.trim() || "Destination";
  return {
    label,
    country: country?.trim() || "",
    latitude,
    longitude,
  };
}
