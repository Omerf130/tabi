import "server-only";

import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { resolveRequestLocale } from "@/features/i18n/resolve-request-locale";
import { attachLinkedCostsToIds } from "@/features/finance/linked-expense-queries";
import { connectDb } from "@/lib/db/connect";
import { Accommodation } from "@/models/Accommodation";
import { Trip } from "@/models/Trip";
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
  fallbackName: string,
  tripCountryCode?: string | null,
): Promise<AccommodationViewModel> {
  const identity = await resolveAccommodationIdentity(accommodation, fallbackName, {
    countryCode: tripCountryCode,
  });

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
  fallbackName: string,
  tripCountryCode?: string | null,
): Promise<AccommodationSettingsViewModel> {
  const base = await toAccommodationViewModel(
    accommodation,
    fallbackName,
    tripCountryCode,
  );

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
  const locale = await resolveRequestLocale();
  const fallbackName = createAppTranslator("Accommodation", locale)("fallbackName");
  const [accommodations, trip] = await Promise.all([
    Accommodation.find({ tripId }).sort({ checkInDate: 1, _id: 1 }).lean(),
    Trip.findById(tripId).select("destination.countryCode").lean(),
  ]);
  const tripCountryCode = trip?.destination?.countryCode;

  const viewModels = await Promise.all(
    accommodations.map((accommodation) =>
      toAccommodationViewModel(accommodation, fallbackName, tripCountryCode),
    ),
  );
  return attachLinkedCostsToIds(tripId, "accommodation", viewModels);
}

export async function listAccommodationsForTripSettings(
  tripId: string,
): Promise<AccommodationSettingsViewModel[]> {
  await connectDb();
  const locale = await resolveRequestLocale();
  const fallbackName = createAppTranslator("Accommodation", locale)("fallbackName");
  const [accommodations, trip] = await Promise.all([
    Accommodation.find({ tripId }).sort({ checkInDate: 1, _id: 1 }).lean(),
    Trip.findById(tripId).select("destination.countryCode").lean(),
  ]);
  const tripCountryCode = trip?.destination?.countryCode;

  const viewModels = await Promise.all(
    accommodations.map((accommodation) =>
      toAccommodationSettingsViewModel(accommodation, fallbackName, tripCountryCode),
    ),
  );
  return attachLinkedCostsToIds(tripId, "accommodation", viewModels);
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

  const locale = await resolveRequestLocale();
  const fallbackName = createAppTranslator("Accommodation", locale)("fallbackName");
  const trip = await Trip.findById(tripId).select("destination.countryCode").lean();
  const viewModel = await toAccommodationViewModel(
    accommodation,
    fallbackName,
    trip?.destination?.countryCode,
  );
  const [withCost] = await attachLinkedCostsToIds(tripId, "accommodation", [viewModel]);
  return withCost;
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

  const locale = await resolveRequestLocale();
  const fallbackName = createAppTranslator("Accommodation", locale)("fallbackName");
  const trip = await Trip.findById(tripId).select("destination.countryCode").lean();
  return toAccommodationSettingsViewModel(
    accommodation,
    fallbackName,
    trip?.destination?.countryCode,
  );
}
