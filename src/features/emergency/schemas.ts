import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";
import { EMERGENCY_CUSTOM_CATEGORIES } from "./types";

const objectIdSchema = z.string().refine(isValidObjectId, { message: "Invalid id" });

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }
      const trimmed = String(value).trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.union([z.undefined(), z.string().max(max)]),
  );

const optionalPhoneSchema = z.preprocess(
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
      .min(3)
      .max(40)
      .regex(/^[\d+\-\s()]+$/, { message: "Invalid phone" }),
  ]),
);

const optionalEmailSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.union([z.undefined(), z.string().email({ message: "Invalid email" })]),
);

const optionalUrlSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.union([z.undefined(), z.string().url({ message: "Invalid url" }).max(2000)]),
);

const emergencyResourceFieldsSchema = z
  .object({
    category: z.enum(EMERGENCY_CUSTOM_CATEGORIES),
    title: z.string().trim().min(2).max(120),
    phone: optionalPhoneSchema,
    secondaryPhone: optionalPhoneSchema,
    email: optionalEmailSchema,
    address: optionalTrimmedString(300),
    url: optionalUrlSchema,
    reference: optionalTrimmedString(120),
    notes: optionalTrimmedString(500),
  })
  .superRefine((value, ctx) => {
    const hasInfoField = [
      value.phone,
      value.secondaryPhone,
      value.email,
      value.address,
      value.url,
      value.reference,
      value.notes,
    ].some(Boolean);

    if (!hasInfoField) {
      ctx.addIssue({
        code: "custom",
        message: "At least one information field is required",
        path: ["notes"],
      });
    }
  });

export const createTripEmergencyResourceSchema = emergencyResourceFieldsSchema.and(
  z.object({
    tripId: objectIdSchema,
  }),
);

export const updateTripEmergencyResourceSchema = emergencyResourceFieldsSchema.and(
  z.object({
    tripId: objectIdSchema,
    resourceId: objectIdSchema,
  }),
);

export const deleteTripEmergencyResourceSchema = z.object({
  tripId: objectIdSchema,
  resourceId: objectIdSchema,
});

export type CreateTripEmergencyResourceInput = z.infer<
  typeof createTripEmergencyResourceSchema
>;
export type UpdateTripEmergencyResourceInput = z.infer<
  typeof updateTripEmergencyResourceSchema
>;
