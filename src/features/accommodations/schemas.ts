import { z } from "zod";
import {
  isValidCalendarDateString,
  normalizeCalendarDateInput,
} from "@/features/trips/calendar-date";
import { isValidObjectId } from "@/features/trips/object-id";
import { isValidGooglePlaceId } from "@/features/places/placeSession";
import {
  ACCOMMODATION_ADDRESS_MAX_LENGTH,
  ACCOMMODATION_BOOKING_REFERENCE_MAX_LENGTH,
  ACCOMMODATION_CITY_MAX_LENGTH,
  ACCOMMODATION_GOOGLE_MAPS_URL_MAX_LENGTH,
  ACCOMMODATION_NAME_JAPANESE_MAX_LENGTH,
  ACCOMMODATION_NAME_MAX_LENGTH,
  ACCOMMODATION_NOTES_MAX_LENGTH,
} from "./constants";

const objectIdSchema = z.string().refine(isValidObjectId, {
  message: "Invalid id",
});

const calendarDateSchema = z
  .string()
  .trim()
  .refine((value) => isValidCalendarDateString(value), {
    message: "invalid calendar date",
  })
  .transform((value) => normalizeCalendarDateInput(value)!);

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      const trimmed = String(value).trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.union([z.undefined(), z.string().max(maxLength)]),
  );

const optionalGoogleMapsUrlSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.union([
    z.undefined(),
    z
      .string()
      .max(ACCOMMODATION_GOOGLE_MAPS_URL_MAX_LENGTH)
      .url({ message: "invalid url" }),
  ]),
);

const tripFieldsSchema = z.object({
  checkInDate: calendarDateSchema,
  checkOutDate: calendarDateSchema,
  bookingReference: optionalTrimmedString(ACCOMMODATION_BOOKING_REFERENCE_MAX_LENGTH),
  notes: optionalTrimmedString(ACCOMMODATION_NOTES_MAX_LENGTH),
});

export const googleAccommodationFieldsSchema = tripFieldsSchema.extend({
  placeSource: z.literal("google"),
  googlePlaceId: z
    .string()
    .trim()
    .refine(isValidGooglePlaceId, { message: "invalid place id" }),
});

export const manualAccommodationFieldsSchema = tripFieldsSchema.extend({
  placeSource: z.literal("manual"),
  manualName: z.string().trim().min(1).max(ACCOMMODATION_NAME_MAX_LENGTH),
  manualNameJapanese: optionalTrimmedString(ACCOMMODATION_NAME_JAPANESE_MAX_LENGTH),
  manualCity: z.string().trim().min(1).max(ACCOMMODATION_CITY_MAX_LENGTH),
  manualAddressEnglish: optionalTrimmedString(ACCOMMODATION_ADDRESS_MAX_LENGTH),
  manualAddressJapanese: optionalTrimmedString(ACCOMMODATION_ADDRESS_MAX_LENGTH),
  manualGoogleMapsUrl: optionalGoogleMapsUrlSchema,
});

export const accommodationFieldsSchema = z.discriminatedUnion("placeSource", [
  googleAccommodationFieldsSchema,
  manualAccommodationFieldsSchema,
]);

export const createAccommodationSchema = z.intersection(
  accommodationFieldsSchema,
  z.object({ tripId: objectIdSchema }),
);

export const updateAccommodationSchema = z.intersection(
  accommodationFieldsSchema,
  z.object({
    tripId: objectIdSchema,
    accommodationId: objectIdSchema,
  }),
);

export const accommodationMutationSchema = z.object({
  tripId: objectIdSchema,
  accommodationId: objectIdSchema,
});

export type GoogleAccommodationFieldsInput = z.infer<
  typeof googleAccommodationFieldsSchema
>;
export type ManualAccommodationFieldsInput = z.infer<
  typeof manualAccommodationFieldsSchema
>;
export type AccommodationFieldsInput = z.infer<typeof accommodationFieldsSchema>;
export type CreateAccommodationInput = z.infer<typeof createAccommodationSchema>;
export type UpdateAccommodationInput = z.infer<typeof updateAccommodationSchema>;

function readPlaceSource(value: FormDataEntryValue | null): "google" | "manual" {
  return value === "google" ? "google" : "manual";
}

export function parseAccommodationFieldsFromFormData(formData: FormData) {
  const placeSource = readPlaceSource(formData.get("placeSource"));

  const shared = {
    tripId: formData.get("tripId"),
    checkInDate: formData.get("checkInDate"),
    checkOutDate: formData.get("checkOutDate"),
    bookingReference: formData.get("bookingReference"),
    notes: formData.get("notes"),
  };

  if (placeSource === "google") {
    return {
      ...shared,
      placeSource,
      googlePlaceId: formData.get("googlePlaceId"),
    };
  }

  return {
    ...shared,
    placeSource,
    manualName: formData.get("manualName"),
    manualNameJapanese: formData.get("manualNameJapanese"),
    manualCity: formData.get("manualCity"),
    manualAddressEnglish: formData.get("manualAddressEnglish"),
    manualAddressJapanese: formData.get("manualAddressJapanese"),
    manualGoogleMapsUrl: formData.get("manualGoogleMapsUrl"),
  };
}
