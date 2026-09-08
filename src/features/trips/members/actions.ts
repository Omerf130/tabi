"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { requireTripOwner } from "@/features/trips/authorization";
import { changeTripMemberRole } from "./change-role";
import { MEMBER_MESSAGES } from "./constants";
import { LastOwnerError, MemberNotFoundError } from "./errors";
import { removeTripMember } from "./remove-member";
import { changeMemberRoleSchema, removeMemberSchema } from "./schemas";

export type MemberActionState = {
  error?: string;
  success?: string;
};

export async function changeTripMemberRoleAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  await requireUser();

  const parsed = changeMemberRoleSchema.safeParse({
    tripId: formData.get("tripId"),
    membershipId: formData.get("membershipId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: MEMBER_MESSAGES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await changeTripMemberRole(
      parsed.data.tripId,
      parsed.data.membershipId,
      parsed.data.role,
    );
    revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
    return { success: MEMBER_MESSAGES.roleChanged };
  } catch (error) {
    if (error instanceof LastOwnerError) {
      return { error: MEMBER_MESSAGES.lastOwner };
    }
    if (error instanceof MemberNotFoundError) {
      return { error: MEMBER_MESSAGES.generic };
    }
    return { error: MEMBER_MESSAGES.generic };
  }
}

export async function removeTripMemberAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  await requireUser();

  const parsed = removeMemberSchema.safeParse({
    tripId: formData.get("tripId"),
    membershipId: formData.get("membershipId"),
  });

  if (!parsed.success) {
    return { error: MEMBER_MESSAGES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await removeTripMember(parsed.data.tripId, parsed.data.membershipId);
    revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
    return { success: MEMBER_MESSAGES.removed };
  } catch (error) {
    if (error instanceof LastOwnerError) {
      return { error: MEMBER_MESSAGES.lastOwner };
    }
    if (error instanceof MemberNotFoundError) {
      return { error: MEMBER_MESSAGES.generic };
    }
    return { error: MEMBER_MESSAGES.generic };
  }
}
