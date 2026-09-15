import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import { tripThemeKeySchema } from "./trip-theme-schema";

const tripIdSchema = z.string().refine(isValidObjectId, {
  message: "invalid trip id",
});

export const updateTripThemeSchema = z
  .object({
    tripId: tripIdSchema,
    themeKey: tripThemeKeySchema,
  })
  .strict();

export type UpdateTripThemeInput = z.infer<typeof updateTripThemeSchema>;
