import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import { CUSTOM_TRANSLATION_MAX_LENGTH } from "./translation/translate-custom-phrase.server";

export const customPhraseTranslationRequestSchema = z.object({
  tripId: z.string().refine(isValidObjectId, { message: "Invalid trip id" }),
  text: z
    .string()
    .trim()
    .min(1, "Text is required")
    .max(CUSTOM_TRANSLATION_MAX_LENGTH, "Text is too long"),
});
