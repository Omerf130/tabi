import type { AppTranslator } from "@/features/i18n/create-app-translator";
import type { InviteErrorCode } from "./constants";
import type { InviteStatus } from "./public-invite";
import type { TripMemberRole } from "@/models/TripMember";

export function translateInvitationError(
  t: AppTranslator<"TripInvitations">,
  code?: InviteErrorCode | string,
): string | undefined {
  if (!code) {
    return undefined;
  }

  if (!/^[a-zA-Z]+$/.test(code)) {
    return code;
  }

  return t(`errors.${code as InviteErrorCode}`);
}

export function createInviteStatusLabelResolver(
  t: AppTranslator<"TripInvitations">,
) {
  return (status: InviteStatus) => t(`statuses.${status}`);
}

export function createInviteRoleLabelResolver(t: AppTranslator<"Trips">) {
  return (role: TripMemberRole) => t(`roles.${role}`);
}
