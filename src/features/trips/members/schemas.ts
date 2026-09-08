import "server-only";

import { z } from "zod";
import { isValidObjectId } from "@/features/trips/object-id";

export const changeMemberRoleSchema = z.object({
  tripId: z.string().refine(isValidObjectId, { message: "Invalid tripId" }),
  membershipId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid membershipId" }),
  role: z.enum(["owner", "member"]),
});

export const removeMemberSchema = z.object({
  tripId: z.string().refine(isValidObjectId, { message: "Invalid tripId" }),
  membershipId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid membershipId" }),
});

export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
