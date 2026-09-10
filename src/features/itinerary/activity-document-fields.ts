import type { ActivityFieldsInput } from "./schemas";

export function toActivityDocumentFields(input: ActivityFieldsInput) {
  if (input.placeSource === "google") {
    return {
      placeSource: "google" as const,
      googlePlaceId: input.googlePlaceId,
      locationName: input.locationName,
      address: input.address ?? null,
      city: input.city ?? null,
      country: input.country ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      googleMapsUrl: input.googleMapsUrl ?? null,
    };
  }

  return {
    placeSource: "manual" as const,
    googlePlaceId: null,
    locationName: input.locationName ?? null,
    address: input.address ?? null,
    city: null,
    country: null,
    latitude: null,
    longitude: null,
    googleMapsUrl: null,
  };
}
