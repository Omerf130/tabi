import "server-only";

import { connectDb } from "@/lib/db/connect";
import { Accommodation } from "@/models/Accommodation";
import {
  formatCalendarDateDisplay,
  formatCalendarDateRangeDisplay,
} from "@/features/trips/calendar-date";
import { getAccommodationNightCount } from "./accommodation-domain";
import {
  resolveAccommodationIdentity,
  type AccommodationRecord,
} from "./resolve-accommodation-identity";
import type {
  AccommodationSettingsViewModel,
  AccommodationViewModel,
} from "./types";

function optionalString(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

async function toAccommodationViewModel(
  accommodation: AccommodationRecord,
): Promise<AccommodationViewModel> {
  const identity = await resolveAccommodationIdentity(accommodation);

  return {
    id: accommodation._id.toString(),
    tripId: accommodation.tripId.toString(),
    placeSource: identity.placeSource,
    googlePlaceId: identity.googlePlaceId,
    name: identity.name,
    nameJapanese: identity.nameJapanese,
    city: identity.city,
    checkInDate: accommodation.checkInDate,
    checkOutDate: accommodation.checkOutDate,
    addressEnglish: identity.addressEnglish,
    addressJapanese: identity.addressJapanese,
    googleMapsUrl: identity.googleMapsUrl,
    bookingReference: optionalString(accommodation.bookingReference),
    notes: optionalString(accommodation.notes),
    checkInLabel: formatCalendarDateDisplay(accommodation.checkInDate),
    checkOutLabel: formatCalendarDateDisplay(accommodation.checkOutDate),
    dateRangeLabel: formatCalendarDateRangeDisplay(
      accommodation.checkInDate,
      accommodation.checkOutDate,
    ),
    nightCount: getAccommodationNightCount(
      accommodation.checkInDate,
      accommodation.checkOutDate,
    ),
    usesGoogleAttribution: identity.usesGoogleAttribution,
  };
}

async function toAccommodationSettingsViewModel(
  accommodation: AccommodationRecord,
): Promise<AccommodationSettingsViewModel> {
  const base = await toAccommodationViewModel(accommodation);

  return {
    ...base,
    manualName:
      optionalString(accommodation.manualName) ?? optionalString(accommodation.name),
    manualNameJapanese:
      optionalString(accommodation.manualNameJapanese) ??
      optionalString(accommodation.nameJapanese),
    manualCity:
      optionalString(accommodation.manualCity) ?? optionalString(accommodation.city),
    manualAddressEnglish:
      optionalString(accommodation.manualAddressEnglish) ??
      optionalString(accommodation.addressEnglish),
    manualAddressJapanese:
      optionalString(accommodation.manualAddressJapanese) ??
      optionalString(accommodation.addressJapanese),
    manualGoogleMapsUrl:
      optionalString(accommodation.manualGoogleMapsUrl) ??
      optionalString(accommodation.googleMapsUrl),
  };
}

export async function listAccommodationsForTrip(
  tripId: string,
): Promise<AccommodationViewModel[]> {
  await connectDb();
  const accommodations = await Accommodation.find({ tripId })
    .sort({ checkInDate: 1, _id: 1 })
    .lean();

  return Promise.all(
    accommodations.map((accommodation) => toAccommodationViewModel(accommodation)),
  );
}

export async function listAccommodationsForTripSettings(
  tripId: string,
): Promise<AccommodationSettingsViewModel[]> {
  await connectDb();
  const accommodations = await Accommodation.find({ tripId })
    .sort({ checkInDate: 1, _id: 1 })
    .lean();

  return Promise.all(
    accommodations.map((accommodation) =>
      toAccommodationSettingsViewModel(accommodation),
    ),
  );
}

export async function getAccommodationForTrip(
  tripId: string,
  accommodationId: string,
): Promise<AccommodationViewModel | null> {
  await connectDb();
  const accommodation = await Accommodation.findOne({
    _id: accommodationId,
    tripId,
  }).lean();

  if (!accommodation) {
    return null;
  }

  return toAccommodationViewModel(accommodation);
}

export async function getAccommodationForTripSettings(
  tripId: string,
  accommodationId: string,
): Promise<AccommodationSettingsViewModel | null> {
  await connectDb();
  const accommodation = await Accommodation.findOne({
    _id: accommodationId,
    tripId,
  }).lean();

  if (!accommodation) {
    return null;
  }

  return toAccommodationSettingsViewModel(accommodation);
}
