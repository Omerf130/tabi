import "server-only";

import { compareCalendarDates } from "@/features/trips/calendar-date";
import { getTripDayCount } from "@/features/trips/trip-days";
import { connectDb } from "@/lib/db/connect";
import { Accommodation } from "@/models/Accommodation";
import { isDateWithinTrip } from "@/features/trips/trip-days";
import { ACCOMMODATION_MESSAGES } from "./constants";
import type { AccommodationFieldsInput } from "./schemas";

export class AccommodationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccommodationValidationError";
  }
}

export class AccommodationNotFoundError extends Error {
  constructor() {
    super(ACCOMMODATION_MESSAGES.notFound);
    this.name = "AccommodationNotFoundError";
  }
}

export type AccommodationPlaceSource = "google" | "manual";

/**
 * Occupancy semantics: checkInDate <= calendarDate < checkOutDate
 * (check-in included, check-out excluded).
 */
export function isAccommodationOccupiedOnDate(
  checkInDate: string,
  checkOutDate: string,
  calendarDate: string,
): boolean {
  return (
    compareCalendarDates(calendarDate, checkInDate) >= 0 &&
    compareCalendarDates(calendarDate, checkOutDate) < 0
  );
}

export function assertAccommodationDateRange(
  checkInDate: string,
  checkOutDate: string,
  startDate: string,
  endDate: string,
): void {
  if (compareCalendarDates(checkOutDate, checkInDate) <= 0) {
    throw new AccommodationValidationError(ACCOMMODATION_MESSAGES.invalidDateRange);
  }

  if (!isDateWithinTrip(startDate, endDate, checkInDate)) {
    throw new AccommodationValidationError(ACCOMMODATION_MESSAGES.dateOutOfRange);
  }

  if (!isDateWithinTrip(startDate, endDate, checkOutDate)) {
    throw new AccommodationValidationError(ACCOMMODATION_MESSAGES.dateOutOfRange);
  }
}

export function getAccommodationNightCount(
  checkInDate: string,
  checkOutDate: string,
): number {
  return getTripDayCount(checkInDate, checkOutDate) - 1;
}

export function resolveStoredPlaceSource(
  placeSource: AccommodationPlaceSource | null | undefined,
): AccommodationPlaceSource {
  return placeSource ?? "manual";
}

function toGoogleDocumentFields(fields: Extract<AccommodationFieldsInput, { placeSource: "google" }>) {
  return {
    placeSource: "google" as const,
    googlePlaceId: fields.googlePlaceId,
    manualName: null,
    manualNameJapanese: null,
    manualCity: null,
    manualAddressEnglish: null,
    manualAddressJapanese: null,
    manualGoogleMapsUrl: null,
    checkInDate: fields.checkInDate,
    checkOutDate: fields.checkOutDate,
    bookingReference: fields.bookingReference ?? null,
    notes: fields.notes ?? null,
  };
}

function toManualDocumentFields(
  fields: Extract<AccommodationFieldsInput, { placeSource: "manual" }>,
) {
  return {
    placeSource: "manual" as const,
    googlePlaceId: null,
    manualName: fields.manualName,
    manualNameJapanese: fields.manualNameJapanese ?? null,
    manualCity: fields.manualCity,
    manualAddressEnglish: fields.manualAddressEnglish ?? null,
    manualAddressJapanese: fields.manualAddressJapanese ?? null,
    manualGoogleMapsUrl: fields.manualGoogleMapsUrl ?? null,
    checkInDate: fields.checkInDate,
    checkOutDate: fields.checkOutDate,
    bookingReference: fields.bookingReference ?? null,
    notes: fields.notes ?? null,
  };
}

function toAccommodationDocumentFields(fields: AccommodationFieldsInput) {
  if (fields.placeSource === "google") {
    return toGoogleDocumentFields(fields);
  }
  return toManualDocumentFields(fields);
}

export async function createAccommodation(input: {
  tripId: string;
  startDate: string;
  endDate: string;
  fields: AccommodationFieldsInput;
}): Promise<string> {
  assertAccommodationDateRange(
    input.fields.checkInDate,
    input.fields.checkOutDate,
    input.startDate,
    input.endDate,
  );

  await connectDb();
  const created = await Accommodation.create({
    tripId: input.tripId,
    ...toAccommodationDocumentFields(input.fields),
  });

  return created._id.toString();
}

export async function updateAccommodation(input: {
  tripId: string;
  accommodationId: string;
  startDate: string;
  endDate: string;
  fields: AccommodationFieldsInput;
}): Promise<void> {
  assertAccommodationDateRange(
    input.fields.checkInDate,
    input.fields.checkOutDate,
    input.startDate,
    input.endDate,
  );

  await connectDb();
  const updated = await Accommodation.findOneAndUpdate(
    { _id: input.accommodationId, tripId: input.tripId },
    toAccommodationDocumentFields(input.fields),
    { new: true },
  ).lean();

  if (!updated) {
    throw new AccommodationNotFoundError();
  }
}

export async function deleteAccommodation(input: {
  tripId: string;
  accommodationId: string;
}): Promise<void> {
  await connectDb();
  const deleted = await Accommodation.findOneAndDelete({
    _id: input.accommodationId,
    tripId: input.tripId,
  }).lean();

  if (!deleted) {
    throw new AccommodationNotFoundError();
  }
}

export function compareAccommodations<
  T extends { checkInDate: string; id: string },
>(a: T, b: T): number {
  const byCheckIn = compareCalendarDates(a.checkInDate, b.checkInDate);
  if (byCheckIn !== 0) {
    return byCheckIn;
  }
  return a.id.localeCompare(b.id);
}
