import {
  buildGoogleMapsCoordinatesUrl,
  buildGoogleMapsSearchUrl,
} from "./google-maps-url";
import type { MapsApp } from "./maps-app";

export type BuildNavigationUrlInput = {
  provider: MapsApp;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  label?: string | null;
  googleMapsUrl?: string | null;
};

export function isSafeHttpNavigationUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function hasValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    isValidLatitude(latitude) &&
    isValidLongitude(longitude)
  );
}

function resolveSearchQuery(input: {
  address?: string | null;
  label?: string | null;
}): string | null {
  const address = input.address?.trim();
  if (address) {
    return address;
  }
  const label = input.label?.trim();
  if (label) {
    return label;
  }
  return null;
}

function buildWazeUrl(input: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  label?: string | null;
}): string | null {
  if (hasValidCoordinates(input.latitude, input.longitude)) {
    const params = new URLSearchParams({
      ll: `${input.latitude},${input.longitude}`,
      navigate: "yes",
    });
    return `https://waze.com/ul?${params.toString()}`;
  }

  const query = resolveSearchQuery(input);
  if (!query) {
    return null;
  }

  const params = new URLSearchParams({
    q: query,
    navigate: "yes",
  });
  return `https://waze.com/ul?${params.toString()}`;
}

function buildAppleMapsUrl(input: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  label?: string | null;
}): string | null {
  if (hasValidCoordinates(input.latitude, input.longitude)) {
    const params = new URLSearchParams({
      ll: `${input.latitude},${input.longitude}`,
    });
    return `https://maps.apple.com/?${params.toString()}`;
  }

  const query = resolveSearchQuery(input);
  if (!query) {
    return null;
  }

  const params = new URLSearchParams({ q: query });
  return `https://maps.apple.com/?${params.toString()}`;
}

function buildGoogleUrl(input: BuildNavigationUrlInput): string | null {
  const persisted = input.googleMapsUrl?.trim();
  if (persisted && isSafeHttpNavigationUrl(persisted)) {
    return persisted;
  }

  if (
    hasValidCoordinates(input.latitude, input.longitude) &&
    typeof input.longitude === "number"
  ) {
    return buildGoogleMapsCoordinatesUrl(input.latitude, input.longitude);
  }

  const query = resolveSearchQuery(input);
  if (!query) {
    return null;
  }

  return buildGoogleMapsSearchUrl(query);
}

export function buildNavigationUrl(input: BuildNavigationUrlInput): string | null {
  switch (input.provider) {
    case "google":
      return buildGoogleUrl(input);
    case "waze":
      return buildWazeUrl(input);
    case "apple":
      return buildAppleMapsUrl(input);
    default: {
      const _exhaustive: never = input.provider;
      return _exhaustive;
    }
  }
}
