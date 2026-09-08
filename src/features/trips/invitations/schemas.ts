import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";

export const createInviteSchema = z.object({
  tripId: z.string().refine(isValidObjectId, { message: "Invalid tripId" }),
  role: z.enum(["owner", "member"]),
});

export const revokeInviteSchema = z.object({
  tripId: z.string().refine(isValidObjectId, { message: "Invalid tripId" }),
  invitationId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid invitationId" }),
});

export const acceptInviteSchema = z.object({
  token: z
    .string()
    .min(20)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type RevokeInviteInput = z.infer<typeof revokeInviteSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
