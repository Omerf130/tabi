import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import {
  PLACES_AUTOCOMPLETE_MAX_INPUT_LENGTH,
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
} from "./constants";
import { isValidGooglePlaceId, isValidPlaceSessionToken } from "./placeSession";

const tripIdSchema = z.string().refine(isValidObjectId, { message: "Invalid tripId" });

const sessionTokenSchema = z
  .string()
  .trim()
  .refine(isValidPlaceSessionToken, { message: "Invalid session token" });

const placeIdSchema = z
  .string()
  .trim()
  .refine(isValidGooglePlaceId, { message: "Invalid place id" });

export const placesAutocompleteRequestSchema = z.object({
  tripId: tripIdSchema,
  input: z
    .string()
    .trim()
    .min(PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH)
    .max(PLACES_AUTOCOMPLETE_MAX_INPUT_LENGTH),
  sessionToken: sessionTokenSchema,
});

export const placesResolveRequestSchema = z.object({
  tripId: tripIdSchema,
  placeId: placeIdSchema,
  sessionToken: sessionTokenSchema,
  primaryText: z.string().trim().min(1).max(200),
  secondaryText: z.string().trim().max(300).optional(),
});

export type PlacesAutocompleteRequest = z.infer<
  typeof placesAutocompleteRequestSchema
>;
export type PlacesResolveRequest = z.infer<typeof placesResolveRequestSchema>;
