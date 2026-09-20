import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import { isAzureSupportedTravelLanguageCode } from "../translation/azure-supported-travel-languages";

const objectIdSchema = z.string().refine(isValidObjectId, { message: "Invalid id" });

export const updateTripTravelLanguageSchema = z
  .object({
    tripId: objectIdSchema,
    selectionMode: z.enum(["automatic", "manual"]),
    travelLanguageCode: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.selectionMode === "automatic") {
      return;
    }

    const code = value.travelLanguageCode?.trim();
    if (!code) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Missing travel language",
        path: ["travelLanguageCode"],
      });
      return;
    }

    if (!isAzureSupportedTravelLanguageCode(code)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Unsupported travel language",
        path: ["travelLanguageCode"],
      });
    }
  });

export type UpdateTripTravelLanguageInput = z.infer<typeof updateTripTravelLanguageSchema>;
