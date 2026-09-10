import { z } from "zod";
import { isValidGooglePlaceId } from "@/features/places/placeSession";
import {
  compareCalendarDates,
  isValidCalendarDateString,
  normalizeCalendarDateInput,
} from "./calendar-date";
import {
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

export const createTripSchema = z
  .object({
    name: z.string().trim().min(TRIP_NAME_MIN_LENGTH).max(TRIP_NAME_MAX_LENGTH),
    startDate: calendarDateSchema,
    endDate: calendarDateSchema,
  })
  .strict()
  .refine(
    (data) => compareCalendarDates(data.startDate, data.endDate) <= 0,
    {
      message: "startDate must be before or equal to endDate",
      path: ["endDate"],
    },
  )
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

const tripCoreFieldsSchema = z.object({
  name: z.string().trim().min(TRIP_NAME_MIN_LENGTH).max(TRIP_NAME_MAX_LENGTH),
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
