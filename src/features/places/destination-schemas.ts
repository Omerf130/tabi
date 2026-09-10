import { z } from "zod";
import {
  PLACES_AUTOCOMPLETE_MAX_INPUT_LENGTH,
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
} from "./constants";
import { isValidGooglePlaceId, isValidPlaceSessionToken } from "./placeSession";

const sessionTokenSchema = z
  .string()
  .trim()
  .refine(isValidPlaceSessionToken, { message: "Invalid session token" });

const placeIdSchema = z
  .string()
  .trim()
  .refine(isValidGooglePlaceId, { message: "Invalid place id" });

export const destinationAutocompleteRequestSchema = z.object({
  input: z
    .string()
    .trim()
    .min(PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH)
    .max(PLACES_AUTOCOMPLETE_MAX_INPUT_LENGTH),
  sessionToken: sessionTokenSchema,
});

export const destinationResolveRequestSchema = z.object({
  placeId: placeIdSchema,
  sessionToken: sessionTokenSchema,
  primaryText: z.string().trim().min(1).max(200),
  secondaryText: z.string().trim().max(300).optional(),
});
