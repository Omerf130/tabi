import { z } from "zod";
import {
  isValidCalendarDateString,
  normalizeCalendarDateInput,
} from "@/features/trips/calendar-date";
import { isValidObjectId } from "@/features/trips/object-id";
import { isValidWallClockTime } from "@/features/itinerary/time";
import { isValidIanaTimeZone } from "@/features/trips/destination/is-valid-iana-time-zone";
import { TRIP_REMINDER_TEXT_MAX_LENGTH } from "./constants";

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

const wallClockTimeSchema = z
  .string()
  .trim()
  .refine(isValidWallClockTime, { message: "invalid wall clock time" });

const reminderTimeZoneSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => isValidIanaTimeZone(value), {
    message: "invalid IANA timezone",
  });

export const tripReminderFieldsSchema = z.object({
  date: calendarDateSchema,
  time: wallClockTimeSchema,
  text: z.string().trim().min(1).max(TRIP_REMINDER_TEXT_MAX_LENGTH),
});

export const tripReminderSchedulingInputSchema = z.object({
  timeZone: reminderTimeZoneSchema,
});

export const createTripReminderSchema = tripReminderFieldsSchema
  .extend({
    tripId: objectIdSchema,
    timeZone: reminderTimeZoneSchema,
  })
  .strict();

export const updateTripReminderSchema = tripReminderFieldsSchema
  .extend({
    tripId: objectIdSchema,
    reminderId: objectIdSchema,
    timeZone: reminderTimeZoneSchema,
  })
  .strict();

export const tripReminderMutationSchema = z.object({
  tripId: objectIdSchema,
  reminderId: objectIdSchema,
});
