import { z } from "zod";
import {
  isValidCalendarDateString,
  normalizeCalendarDateInput,
} from "@/features/trips/calendar-date";
import { isValidObjectId } from "@/features/trips/object-id";
import { isValidGooglePlaceId } from "@/features/places/placeSession";
import { ACTIVITY_TYPES } from "./activity-types";
import {
  ACTIVITY_ADDRESS_MAX_LENGTH,
  ACTIVITY_CITY_MAX_LENGTH,
  ACTIVITY_COUNTRY_MAX_LENGTH,
  ACTIVITY_GOOGLE_MAPS_URL_MAX_LENGTH,
  ACTIVITY_LOCATION_MAX_LENGTH,
  ACTIVITY_NOTES_MAX_LENGTH,
  ACTIVITY_TITLE_MAX_LENGTH,
  ACTIVITY_TITLE_MIN_LENGTH,
} from "./constants";
import { isValidWallClockTime } from "./time";

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

const optionalWallClockTimeSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z
    .union([
      z.undefined(),
      z.string().refine(isValidWallClockTime, {
        message: "invalid wall clock time",
      }),
    ]),
);

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
      .max(ACTIVITY_GOOGLE_MAPS_URL_MAX_LENGTH)
      .url({ message: "invalid url" }),
  ]),
);

const latitudeSchema = z.coerce.number().min(-90).max(90);
const longitudeSchema = z.coerce.number().min(-180).max(180);

const activityCoreFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(ACTIVITY_TITLE_MIN_LENGTH)
    .max(ACTIVITY_TITLE_MAX_LENGTH),
  type: z.enum(ACTIVITY_TYPES),
  date: calendarDateSchema,
  startTime: optionalWallClockTimeSchema,
  endTime: optionalWallClockTimeSchema,
  notes: optionalTrimmedString(ACTIVITY_NOTES_MAX_LENGTH),
});

export const googleActivityLocationSchema = activityCoreFieldsSchema.extend({
  placeSource: z.literal("google"),
  googlePlaceId: z
    .string()
    .trim()
    .refine(isValidGooglePlaceId, { message: "invalid place id" }),
  locationName: z.string().trim().min(1).max(ACTIVITY_LOCATION_MAX_LENGTH),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  address: optionalTrimmedString(ACTIVITY_ADDRESS_MAX_LENGTH),
  city: optionalTrimmedString(ACTIVITY_CITY_MAX_LENGTH),
  country: optionalTrimmedString(ACTIVITY_COUNTRY_MAX_LENGTH),
  googleMapsUrl: optionalGoogleMapsUrlSchema,
});

export const manualActivityLocationSchema = activityCoreFieldsSchema.extend({
  placeSource: z.literal("manual"),
  locationName: optionalTrimmedString(ACTIVITY_LOCATION_MAX_LENGTH),
  address: optionalTrimmedString(ACTIVITY_ADDRESS_MAX_LENGTH),
});

export const activityFieldsSchema = z.discriminatedUnion("placeSource", [
  googleActivityLocationSchema,
  manualActivityLocationSchema,
]);

function withTimeOrderRefine<T extends z.ZodTypeAny>(schema: T) {
  return schema.refine(
    (data) => {
      const fields = data as z.infer<typeof activityCoreFieldsSchema>;
      if (fields.endTime && !fields.startTime) {
        return false;
      }
      if (
        fields.startTime &&
        fields.endTime &&
        fields.endTime < fields.startTime
      ) {
        return false;
      }
      return true;
    },
    {
      message: "invalid activity time range",
      path: ["endTime"],
    },
  );
}

export const createActivitySchema = withTimeOrderRefine(
  z.intersection(activityFieldsSchema, z.object({ tripId: objectIdSchema })),
);

export const updateActivitySchema = withTimeOrderRefine(
  z.intersection(
    activityFieldsSchema,
    z.object({
      tripId: objectIdSchema,
      activityId: objectIdSchema,
    }),
  ),
);

export const deleteActivitySchema = z
  .object({
    tripId: objectIdSchema,
    activityId: objectIdSchema,
  })
  .strict();

export const reorderActivitySchema = z
  .object({
    tripId: objectIdSchema,
    activityId: objectIdSchema,
    direction: z.enum(["up", "down"]),
  })
  .strict();

export type GoogleActivityFieldsInput = z.infer<typeof googleActivityLocationSchema>;
export type ManualActivityFieldsInput = z.infer<typeof manualActivityLocationSchema>;
export type ActivityFieldsInput = z.infer<typeof activityFieldsSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type DeleteActivityInput = z.infer<typeof deleteActivitySchema>;
export type ReorderActivityInput = z.infer<typeof reorderActivitySchema>;

function readActivityPlaceSource(
  value: FormDataEntryValue | null,
): "google" | "manual" {
  return value === "google" ? "google" : "manual";
}

export function parseActivityFieldsFromFormData(formData: FormData) {
  const placeSource = readActivityPlaceSource(formData.get("placeSource"));

  const shared = {
    title: formData.get("title"),
    type: formData.get("type"),
    date: formData.get("date"),
    startTime: formData.get("startTime") ?? "",
    endTime: formData.get("endTime") ?? "",
    notes: formData.get("notes") ?? "",
  };

  if (placeSource === "google") {
    return {
      ...shared,
      placeSource,
      googlePlaceId: formData.get("googlePlaceId"),
      locationName: formData.get("locationName"),
      address: formData.get("address") ?? "",
      city: formData.get("city") ?? "",
      country: formData.get("country") ?? "",
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      googleMapsUrl: formData.get("googleMapsUrl") ?? "",
    };
  }

  return {
    ...shared,
    placeSource,
    locationName: formData.get("locationName") ?? "",
    address: formData.get("address") ?? "",
  };
}
