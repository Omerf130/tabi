import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import { DEFAULT_PHRASEBOOK_PACK_ID } from "./constants";
import { getDefaultPhrasebookPack } from "./builtin/registry";

const objectIdSchema = z.string().refine(isValidObjectId, { message: "Invalid id" });

const phraseIdSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => getDefaultPhrasebookPack().phrases.some((phrase) => phrase.id === value), {
    message: "Invalid phrase id",
  });

export const togglePhraseFavoriteSchema = z.object({
  tripId: objectIdSchema,
  phraseId: phraseIdSchema,
  packId: z.literal(DEFAULT_PHRASEBOOK_PACK_ID),
});

export type TogglePhraseFavoriteInput = z.infer<typeof togglePhraseFavoriteSchema>;
