"use server";

import { revalidatePath } from "next/cache";
import { revalidateTripManagement } from "@/features/trip-management/revalidation";
import { requireUser } from "@/features/auth/session";
import { requireTripOwner } from "@/features/trips/authorization";
import { changeTripMemberRole } from "./change-role";
import { MEMBER_ERROR_CODES, MEMBER_SUCCESS_CODES } from "./constants";
import { LastOwnerError, MemberNotFoundError } from "./errors";
import { removeTripMember } from "./remove-member";
import { changeMemberRoleSchema, removeMemberSchema } from "./schemas";
import type { MemberErrorCode, MemberSuccessCode } from "./constants";

export type MemberActionState = {
  errorCode?: MemberErrorCode;
  successCode?: MemberSuccessCode;
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
    return { errorCode: MEMBER_ERROR_CODES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await changeTripMemberRole(
      parsed.data.tripId,
      parsed.data.membershipId,
      parsed.data.role,
    );
    revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
    revalidateTripManagement(parsed.data.tripId, "members");
    return { successCode: MEMBER_SUCCESS_CODES.roleChanged };
  } catch (error) {
    if (error instanceof LastOwnerError) {
      return { errorCode: MEMBER_ERROR_CODES.lastOwner };
    }
    if (error instanceof MemberNotFoundError) {
      return { errorCode: MEMBER_ERROR_CODES.generic };
    }
    return { errorCode: MEMBER_ERROR_CODES.generic };
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
    return { errorCode: MEMBER_ERROR_CODES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await removeTripMember(parsed.data.tripId, parsed.data.membershipId);
    revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
    revalidateTripManagement(parsed.data.tripId, "members");
    return { successCode: MEMBER_SUCCESS_CODES.removed };
  } catch (error) {
    if (error instanceof LastOwnerError) {
      return { errorCode: MEMBER_ERROR_CODES.lastOwner };
    }
    if (error instanceof MemberNotFoundError) {
      return { errorCode: MEMBER_ERROR_CODES.generic };
    }
    return { errorCode: MEMBER_ERROR_CODES.generic };
  }
}
