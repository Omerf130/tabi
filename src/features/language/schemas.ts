import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import { isValidPhraseIntentId } from "./is-valid-phrase-intent-id";

const objectIdSchema = z.string().refine(isValidObjectId, { message: "Invalid id" });

const phraseIdSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => isValidPhraseIntentId(value), {
    message: "Invalid phrase id",
  });

export const togglePhraseFavoriteSchema = z.object({
  tripId: objectIdSchema,
  phraseId: phraseIdSchema,
});

export type TogglePhraseFavoriteInput = z.infer<typeof togglePhraseFavoriteSchema>;
