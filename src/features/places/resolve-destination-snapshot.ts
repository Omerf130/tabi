import "server-only";

import {
  extractCityFromAddressComponents,
  extractCityFromSecondaryText,
} from "./extractCity";
import { extractCountryFromAddressComponents } from "./extractCountry";
import { extractCountryCodeFromAddressComponents } from "./extractCountryCode";
import {
  GooglePlacesRequestError,
  fetchPlaceGeographyDetails,
} from "./googlePlaces.server";
import { PLACES_MESSAGES } from "./constants";
import { isGeographicWeatherPlace } from "@/features/weather/is-geographic-place";

export type TripDestinationSnapshot = {
  googlePlaceId: string;
  displayName: string;
  secondaryLabel?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
};

function buildSecondaryLabel(input: {
  cityOrRegion?: string;
  country?: string;
  formattedAddress?: string;
  fallbackSecondaryText?: string;
}): string | undefined {
  if (
    input.cityOrRegion &&
    input.country &&
    input.cityOrRegion !== input.country
  ) {
    return `${input.cityOrRegion}, ${input.country}`;
  }
  return (
    input.formattedAddress ||
    input.fallbackSecondaryText?.trim() ||
    input.country ||
    undefined
  );
}

export async function resolveDestinationSnapshot(
  googlePlaceId: string,
  options: {
    sessionToken?: string;
    primaryText?: string;
    secondaryText?: string;
  } = {},
): Promise<TripDestinationSnapshot> {
  const details = await fetchPlaceGeographyDetails(googlePlaceId, {
    sessionToken: options.sessionToken,
    languageCode: "en",
  });

  if (!isGeographicWeatherPlace(details.types, details.primaryType)) {
    throw new GooglePlacesRequestError(PLACES_MESSAGES.resolveFailed);
  }

  const latitude = details.location?.latitude;
  const longitude = details.location?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new GooglePlacesRequestError(PLACES_MESSAGES.resolveFailed);
  }

  const displayName =
    details.displayName?.text?.trim() || options.primaryText?.trim();
  if (!displayName) {
    throw new GooglePlacesRequestError(PLACES_MESSAGES.resolveFailed);
  }

  const country = extractCountryFromAddressComponents(details.addressComponents);
  const countryCode = extractCountryCodeFromAddressComponents(
    details.addressComponents,
  );
  const cityOrRegion =
    extractCityFromAddressComponents(details.addressComponents) ||
    extractCityFromSecondaryText(options.secondaryText);
  const formattedAddress = details.formattedAddress?.trim();

  return {
    googlePlaceId,
    displayName,
    secondaryLabel: buildSecondaryLabel({
      cityOrRegion,
      country,
      formattedAddress,
      fallbackSecondaryText: options.secondaryText,
    }),
    country,
    countryCode,
    latitude,
    longitude,
  };
}
