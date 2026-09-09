import { extractCityFromAddressComponents } from "@/features/places/extractCity";
import { extractCountryFromAddressComponents } from "@/features/places/extractCountry";
import { isGeographicWeatherPlace } from "./is-geographic-place";
import type { WeatherLocationRef } from "./types";

export type GooglePlaceGeographyDetails = {
  displayName?: { text?: string };
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  types?: string[];
  primaryType?: string;
};

function extractRegionFromSecondaryText(secondaryText?: string): string | undefined {
  if (!secondaryText?.trim()) {
    return undefined;
  }

  const parts = secondaryText.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return undefined;
  }

  return parts[parts.length - 2];
}

export function normalizeGooglePlaceToWeatherLocation(
  details: GooglePlaceGeographyDetails,
  fallback: { primaryText: string; secondaryText?: string },
): WeatherLocationRef | null {
  if (!isGeographicWeatherPlace(details.types, details.primaryType)) {
    return null;
  }

  const latitude = details.location?.latitude;
  const longitude = details.location?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const label = details.displayName?.text?.trim() || fallback.primaryText.trim();
  const country = extractCountryFromAddressComponents(details.addressComponents);
  if (!label || !country) {
    return null;
  }

  const region =
    extractCityFromAddressComponents(details.addressComponents) ||
    extractRegionFromSecondaryText(fallback.secondaryText);

  return {
    label,
    region,
    country,
    latitude,
    longitude,
  };
}
