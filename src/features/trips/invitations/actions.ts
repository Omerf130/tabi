"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { getRequestOrigin } from "@/lib/http/get-request-origin";
import { requireTripOwner } from "@/features/trips/authorization";
import { acceptTripInvitation } from "./accept-invitation";
import { createTripInvitation } from "./create-invitation";
import { AlreadyMemberError, InviteInvalidError } from "./errors";
import { revokeTripInvitation } from "./revoke-invitation";
import {
  acceptInviteSchema,
  createInviteSchema,
  revokeInviteSchema,
} from "./schemas";
import { INVITE_MESSAGES } from "./constants";

export type CreateInviteActionState = {
  error?: string;
  inviteUrl?: string;
};

export type AcceptInviteActionState = {
  error?: string;
};

export type RevokeInviteActionState = {
  error?: string;
};

export async function createTripInviteAction(
  _prev: CreateInviteActionState,
  formData: FormData,
): Promise<CreateInviteActionState> {
  const user = await requireUser();

  const parsed = createInviteSchema.safeParse({
    tripId: formData.get("tripId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: INVITE_MESSAGES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
  } catch {
    return { error: INVITE_MESSAGES.generic };
  }

  try {
    const origin = await getRequestOrigin();
    const { inviteUrl } = await createTripInvitation(
      parsed.data.tripId,
      user.id,
      parsed.data.role,
      origin,
    );
    revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
    return { inviteUrl };
  } catch {
    return { error: INVITE_MESSAGES.generic };
  }
}

export async function acceptTripInvitationAction(
  _prev: AcceptInviteActionState,
  formData: FormData,
): Promise<AcceptInviteActionState> {
  const user = await requireUser();

  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { error: INVITE_MESSAGES.invalid };
  }

  let tripId: string;
  try {
    tripId = await acceptTripInvitation(user.id, parsed.data.token);
  } catch (error) {
    if (error instanceof AlreadyMemberError) {
      return { error: INVITE_MESSAGES.alreadyMember };
    }
    if (error instanceof InviteInvalidError) {
      return { error: INVITE_MESSAGES.invalid };
    }
    return { error: INVITE_MESSAGES.generic };
  }

  redirect(`/app/trips/${tripId}`);
}

export async function revokeTripInvitationAction(
  _prev: RevokeInviteActionState,
  formData: FormData,
): Promise<RevokeInviteActionState> {
  await requireUser();

  const parsed = revokeInviteSchema.safeParse({
    tripId: formData.get("tripId"),
    invitationId: formData.get("invitationId"),
  });

  if (!parsed.success) {
    return { error: INVITE_MESSAGES.generic };
  }

  try {
    await requireTripOwner(parsed.data.tripId);
    await revokeTripInvitation(parsed.data.tripId, parsed.data.invitationId);
    revalidatePath(`/app/trips/${parsed.data.tripId}/members`);
    return {};
  } catch {
    return { error: INVITE_MESSAGES.generic };
  }
}
