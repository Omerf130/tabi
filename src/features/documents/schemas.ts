import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import {
  TRAVEL_DOCUMENT_CATEGORIES,
  TRAVEL_DOCUMENT_DESCRIPTION_MAX_LENGTH,
  TRAVEL_DOCUMENT_TITLE_MAX_LENGTH,
  TRAVEL_DOCUMENT_TITLE_MIN_LENGTH,
} from "./constants";

const objectIdSchema = z.string().refine(isValidObjectId, {
  message: "Invalid id",
});

const optionalObjectIdSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.union([
    z.undefined(),
    z.string().refine(isValidObjectId, { message: "Invalid id" }),
  ]),
);

const optionalDescriptionSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.union([
    z.undefined(),
    z.string().max(TRAVEL_DOCUMENT_DESCRIPTION_MAX_LENGTH),
  ]),
);

const optionalTitleSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.union([
    z.undefined(),
    z
      .string()
      .min(TRAVEL_DOCUMENT_TITLE_MIN_LENGTH)
      .max(TRAVEL_DOCUMENT_TITLE_MAX_LENGTH),
  ]),
);

function countContextLinks(value: {
  activityId?: string;
  accommodationId?: string;
  transportId?: string;
}): number {
  return [value.activityId, value.accommodationId, value.transportId].filter(Boolean)
    .length;
}

function validateSingleContextLink(
  value: {
    activityId?: string;
    accommodationId?: string;
    transportId?: string;
  },
  ctx: z.RefinementCtx,
): void {
  if (countContextLinks(value) > 1) {
    ctx.addIssue({
      code: "custom",
      message: "both links",
      path: ["activityId"],
    });
  }
}

const showInEmergencySchema = z.preprocess(
  (value) => value === true || value === "true" || value === "on" || value === "1",
  z.boolean(),
);

export const createTravelDocumentMetadataSchema = z
  .object({
    title: optionalTitleSchema,
    category: z.enum(TRAVEL_DOCUMENT_CATEGORIES),
    description: optionalDescriptionSchema,
    activityId: optionalObjectIdSchema,
    accommodationId: optionalObjectIdSchema,
    transportId: optionalObjectIdSchema,
    showInEmergency: showInEmergencySchema.optional().default(false),
  })
  .superRefine(validateSingleContextLink);

export const travelDocumentMetadataSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(TRAVEL_DOCUMENT_TITLE_MIN_LENGTH)
      .max(TRAVEL_DOCUMENT_TITLE_MAX_LENGTH),
    category: z.enum(TRAVEL_DOCUMENT_CATEGORIES),
    description: optionalDescriptionSchema,
    activityId: optionalObjectIdSchema,
    accommodationId: optionalObjectIdSchema,
    transportId: optionalObjectIdSchema,
    showInEmergency: showInEmergencySchema.optional().default(false),
  })
  .superRefine(validateSingleContextLink);

export const createTravelDocumentSchema = createTravelDocumentMetadataSchema.and(
  z.object({
    tripId: objectIdSchema,
  }),
);

export const updateTravelDocumentSchema = travelDocumentMetadataSchema.and(
  z.object({
    tripId: objectIdSchema,
    documentId: objectIdSchema,
  }),
);

export const replaceTravelDocumentFileSchema = z.object({
  tripId: objectIdSchema,
  documentId: objectIdSchema,
});

export const deleteTravelDocumentSchema = z.object({
  tripId: objectIdSchema,
  documentId: objectIdSchema,
});

export type TravelDocumentMetadataInput = {
  title: string;
  category: z.infer<typeof travelDocumentMetadataSchema>["category"];
  description?: string;
  activityId?: string;
  accommodationId?: string;
  transportId?: string;
  showInEmergency?: boolean;
};
export type CreateTravelDocumentInput = z.infer<typeof createTravelDocumentSchema>;
export type UpdateTravelDocumentInput = z.infer<typeof updateTravelDocumentSchema>;

export function parseTravelDocumentMetadataFromFormData(
  formData: FormData,
): Record<string, FormDataEntryValue | null> {
  const linkType = String(formData.get("linkType") ?? "none");

  return {
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    activityId: linkType === "activity" ? formData.get("activityId") : null,
    accommodationId:
      linkType === "accommodation" ? formData.get("accommodationId") : null,
    transportId: linkType === "transport" ? formData.get("transportId") : null,
    showInEmergency: formData.get("showInEmergency"),
  };
}

export function deriveTitleFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^.]+$/, "");
  const trimmed = withoutExtension.trim();
  if (!trimmed) {
    return "מסמך";
  }
  return trimmed.slice(0, TRAVEL_DOCUMENT_TITLE_MAX_LENGTH);
}
