import "server-only";

import { getPlaceDisplayForTraveler } from "@/features/places/googlePlaces.server";
import {
  resolveStoredPlaceSource,
  type AccommodationPlaceSource,
} from "./accommodation-domain";

export type AccommodationRecord = {
  _id: { toString(): string };
  tripId: { toString(): string };
  placeSource?: AccommodationPlaceSource | null;
  googlePlaceId?: string | null;
  manualName?: string | null;
  manualNameJapanese?: string | null;
  manualCity?: string | null;
  manualAddressEnglish?: string | null;
  manualAddressJapanese?: string | null;
  manualGoogleMapsUrl?: string | null;
  name?: string | null;
  nameJapanese?: string | null;
  city?: string | null;
  addressEnglish?: string | null;
  addressJapanese?: string | null;
  googleMapsUrl?: string | null;
  checkInDate: string;
  checkOutDate: string;
  bookingReference?: string | null;
  notes?: string | null;
};

export type ResolvedAccommodationIdentity = {
  placeSource: AccommodationPlaceSource;
  googlePlaceId?: string;
  name: string;
  nameJapanese?: string;
  city: string;
  addressEnglish?: string;
  addressJapanese?: string;
  googleMapsUrl?: string;
  usesGoogleAttribution: boolean;
};

function optionalString(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

function resolveLegacyManualIdentity(
  accommodation: AccommodationRecord,
): ResolvedAccommodationIdentity {
  return {
    placeSource: "manual",
    name: accommodation.manualName?.trim() || accommodation.name?.trim() || "מקום לינה",
    nameJapanese: optionalString(
      accommodation.manualNameJapanese ?? accommodation.nameJapanese,
    ),
    city: accommodation.manualCity?.trim() || accommodation.city?.trim() || "—",
    addressEnglish: optionalString(
      accommodation.manualAddressEnglish ?? accommodation.addressEnglish,
    ),
    addressJapanese: optionalString(
      accommodation.manualAddressJapanese ?? accommodation.addressJapanese,
    ),
    googleMapsUrl: optionalString(
      accommodation.manualGoogleMapsUrl ?? accommodation.googleMapsUrl,
    ),
    usesGoogleAttribution: false,
  };
}

function resolveExplicitManualIdentity(
  accommodation: AccommodationRecord,
): ResolvedAccommodationIdentity {
  return {
    placeSource: "manual",
    name: accommodation.manualName?.trim() || "מקום לינה",
    nameJapanese: optionalString(accommodation.manualNameJapanese),
    city: accommodation.manualCity?.trim() || "—",
    addressEnglish: optionalString(accommodation.manualAddressEnglish),
    addressJapanese: optionalString(accommodation.manualAddressJapanese),
    googleMapsUrl: optionalString(accommodation.manualGoogleMapsUrl),
    usesGoogleAttribution: false,
  };
}

export async function resolveAccommodationIdentity(
  accommodation: AccommodationRecord,
): Promise<ResolvedAccommodationIdentity> {
  const placeSource = resolveStoredPlaceSource(accommodation.placeSource);

  if (placeSource === "google") {
    const googlePlaceId = accommodation.googlePlaceId?.trim();
    if (!googlePlaceId) {
      return resolveLegacyManualIdentity(accommodation);
    }

    const display = await getPlaceDisplayForTraveler(googlePlaceId);
    if (!display) {
      return {
        placeSource: "google",
        googlePlaceId,
        name: "מקום לינה",
        city: "Japan",
        usesGoogleAttribution: true,
      };
    }

    return {
      placeSource: "google",
      googlePlaceId,
      name: display.name,
      nameJapanese: display.nameJapanese,
      city: display.city,
      addressEnglish: display.addressEnglish,
      addressJapanese: display.addressJapanese,
      googleMapsUrl: display.googleMapsUrl,
      usesGoogleAttribution: true,
    };
  }

  if (accommodation.manualName?.trim()) {
    return resolveExplicitManualIdentity(accommodation);
  }

  return resolveLegacyManualIdentity(accommodation);
}
