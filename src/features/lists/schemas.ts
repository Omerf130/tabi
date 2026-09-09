import { z } from "zod";
import {
  TRIP_LIST_ITEM_TEXT_MAX_LENGTH,
  TRIP_LIST_SLUGS,
  TRIP_LIST_TYPES,
} from "./constants";
import { isValidObjectId } from "@/features/trips/object-id";

const tripIdSchema = z
  .string()
  .refine(isValidObjectId, { message: "Invalid tripId" });

const itemIdSchema = z
  .string()
  .refine(isValidObjectId, { message: "Invalid itemId" });

const listTypeSchema = z.enum(TRIP_LIST_TYPES);

const listSlugSchema = z.enum(TRIP_LIST_SLUGS);

const itemTextSchema = z
  .string()
  .trim()
  .min(1, "יש להזין טקסט לפריט")
  .max(TRIP_LIST_ITEM_TEXT_MAX_LENGTH, "הטקסט ארוך מדי");

const completionStateSchema = z.preprocess((value) => {
  if (value === "true" || value === true) {
    return true;
  }
  if (value === "false" || value === false) {
    return false;
  }
  return value;
}, z.boolean());

export const createTripListItemSchema = z.object({
  tripId: tripIdSchema,
  listType: listTypeSchema,
  text: itemTextSchema,
});

export const updateTripListItemSchema = z.object({
  tripId: tripIdSchema,
  itemId: itemIdSchema,
  text: itemTextSchema,
});

export const setTripListItemCompletedSchema = z.object({
  tripId: tripIdSchema,
  itemId: itemIdSchema,
  isCompleted: completionStateSchema,
});

export const deleteTripListItemSchema = z.object({
  tripId: tripIdSchema,
  itemId: itemIdSchema,
});

export const listSlugParamSchema = z.object({
  listSlug: listSlugSchema,
});
