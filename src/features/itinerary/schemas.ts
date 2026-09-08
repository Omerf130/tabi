import { z } from "zod";
import {
  isValidCalendarDateString,
  normalizeCalendarDateInput,
} from "@/features/trips/calendar-date";
import { isValidObjectId } from "@/features/trips/object-id";
import { ACTIVITY_TYPES } from "./activity-types";
import {
  ACTIVITY_ADDRESS_MAX_LENGTH,
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

const activityFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(ACTIVITY_TITLE_MIN_LENGTH)
    .max(ACTIVITY_TITLE_MAX_LENGTH),
  type: z.enum(ACTIVITY_TYPES),
  date: calendarDateSchema,
  startTime: optionalWallClockTimeSchema,
  endTime: optionalWallClockTimeSchema,
  locationName: z
    .string()
    .trim()
    .max(ACTIVITY_LOCATION_MAX_LENGTH)
    .transform((value) => value || undefined)
    .optional(),
  address: z
    .string()
    .trim()
    .max(ACTIVITY_ADDRESS_MAX_LENGTH)
    .transform((value) => value || undefined)
    .optional(),
  notes: z
    .string()
    .trim()
    .max(ACTIVITY_NOTES_MAX_LENGTH)
    .transform((value) => value || undefined)
    .optional(),
});

function withTimeOrderRefine<T extends z.ZodTypeAny>(schema: T) {
  return schema.refine(
    (data) => {
      const fields = data as z.infer<typeof activityFieldsSchema>;
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
  activityFieldsSchema
    .extend({
      tripId: objectIdSchema,
    })
    .strict(),
);

export const updateActivitySchema = withTimeOrderRefine(
  activityFieldsSchema
    .extend({
      tripId: objectIdSchema,
      activityId: objectIdSchema,
    })
    .strict(),
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

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type DeleteActivityInput = z.infer<typeof deleteActivitySchema>;
export type ReorderActivityInput = z.infer<typeof reorderActivitySchema>;
