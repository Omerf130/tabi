import { z } from "zod";
import { isValidGooglePlaceId } from "@/features/places/placeSession";
import { isValidObjectId } from "./object-id";
import {
  compareCalendarDates,
  isValidCalendarDateString,
  normalizeCalendarDateInput,
} from "./calendar-date";
import {
  TRIP_DESCRIPTION_MAX_LENGTH,
  TRIP_MAX_DURATION_DAYS,
  TRIP_NAME_MAX_LENGTH,
  TRIP_NAME_MIN_LENGTH,
} from "./constants";
import { getTripDayCount } from "./trip-days";

const calendarDateSchema = z
  .string()
  .trim()
  .refine((value) => isValidCalendarDateString(value), {
    message: "invalid calendar date",
  })
  .transform((value) => normalizeCalendarDateInput(value)!);

const tripDateRangeObjectSchema = z
  .object({
    startDate: calendarDateSchema,
    endDate: calendarDateSchema,
  })
  .strict();

export const tripDateRangeSchema = tripDateRangeObjectSchema
  .refine((data) => compareCalendarDates(data.startDate, data.endDate) <= 0, {
    message: "startDate must be before or equal to endDate",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      try {
        return getTripDayCount(data.startDate, data.endDate) <= TRIP_MAX_DURATION_DAYS;
      } catch {
        return false;
      }
    },
    {
      message: "trip duration exceeds maximum",
      path: ["endDate"],
    },
  );

export const createTripSchema = tripDateRangeObjectSchema
  .extend({
    name: z.string().trim().min(TRIP_NAME_MIN_LENGTH).max(TRIP_NAME_MAX_LENGTH),
  })
  .strict()
  .refine((data) => compareCalendarDates(data.startDate, data.endDate) <= 0, {
    message: "startDate must be before or equal to endDate",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      try {
        return getTripDayCount(data.startDate, data.endDate) <= TRIP_MAX_DURATION_DAYS;
      } catch {
        return false;
      }
    },
    {
      message: "trip duration exceeds maximum",
      path: ["endDate"],
    },
  );

export type CreateTripInput = z.infer<typeof createTripSchema>;

export const tripNameSchema = z
  .string()
  .trim()
  .min(TRIP_NAME_MIN_LENGTH)
  .max(TRIP_NAME_MAX_LENGTH);

export const tripDescriptionSchema = z
  .string()
  .trim()
  .max(TRIP_DESCRIPTION_MAX_LENGTH)
  .optional()
  .transform((value) => value ?? "");

const tripIdSchema = z.string().refine(isValidObjectId, {
  message: "invalid trip id",
});

const tripCoreFieldsSchema = z.object({
  name: tripNameSchema,
  description: tripDescriptionSchema,
  startDate: calendarDateSchema,
  endDate: calendarDateSchema,
});

const tripDateRules = <
  T extends z.ZodType<{ name: string; startDate: string; endDate: string }>,
>(
  schema: T,
) =>
  schema
    .refine((data) => compareCalendarDates(data.startDate, data.endDate) <= 0, {
      message: "startDate must be before or equal to endDate",
      path: ["endDate"],
    })
    .refine(
      (data) => {
        try {
          return getTripDayCount(data.startDate, data.endDate) <= TRIP_MAX_DURATION_DAYS;
        } catch {
          return false;
        }
      },
      {
        message: "trip duration exceeds maximum",
        path: ["endDate"],
      },
    );

/** Client submission for wizard create — identity fields only. */
export const createTripWizardSchema = tripDateRules(
  tripCoreFieldsSchema
    .extend({
      googlePlaceId: z
        .string()
        .trim()
        .refine(isValidGooglePlaceId, { message: "invalid place id" }),
    })
    .strict(),
);

export type CreateTripWizardInput = z.infer<typeof createTripWizardSchema>;

export const updateTripIdentitySchema = z
  .object({
    tripId: tripIdSchema,
    name: tripNameSchema,
    description: tripDescriptionSchema,
  })
  .strict();

export type UpdateTripIdentityInput = z.infer<typeof updateTripIdentitySchema>;

export const updateTripDestinationSchema = z
  .object({
    tripId: tripIdSchema,
    googlePlaceId: z
      .string()
      .trim()
      .refine(isValidGooglePlaceId, { message: "invalid place id" }),
  })
  .strict();

export type UpdateTripDestinationInput = z.infer<typeof updateTripDestinationSchema>;

export const previewTripDateChangeSchema = z
  .object({
    tripId: tripIdSchema,
    startDate: calendarDateSchema,
    endDate: calendarDateSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    const rangeResult = tripDateRangeSchema.safeParse({
      startDate: data.startDate,
      endDate: data.endDate,
    });
    if (!rangeResult.success) {
      for (const issue of rangeResult.error.issues) {
        ctx.addIssue({
          code: "custom",
          message: issue.message,
          path: issue.path,
        });
      }
    }
  });

export type PreviewTripDateChangeInput = z.infer<typeof previewTripDateChangeSchema>;

export const applyTripDateChangeSchema = z
  .object({
    tripId: tripIdSchema,
    previewToken: z.string().trim().min(1),
  })
  .strict();

export type ApplyTripDateChangeInput = z.infer<typeof applyTripDateChangeSchema>;
