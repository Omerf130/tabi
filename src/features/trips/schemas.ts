import { z } from "zod";
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
