"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button/Button";
import { localeToIntlLocale, resolveAppLocale } from "@/features/i18n/locale";
import {
  revokeTripInvitationAction,
  type RevokeInviteActionState,
} from "@/features/trips/invitations/actions";
import {
  createInviteRoleLabelResolver,
  createInviteStatusLabelResolver,
  translateInvitationError,
} from "@/features/trips/invitations/translate-invitation-error";
import type { InvitationListItem } from "@/features/trips/invitations/public-invite";
import styles from "./MembersPage.module.scss";

const initialState: RevokeInviteActionState = {};

type InvitationRowProps = {
  tripId: string;
  invitation: InvitationListItem;
};

export function InvitationRow({ tripId, invitation }: InvitationRowProps) {
  const tMembers = useTranslations("TripMembers");
  const tInvitations = useTranslations("TripInvitations");
  const tTrips = useTranslations("Trips");
  const intlLocale = localeToIntlLocale(resolveAppLocale(useLocale()));
  const roleLabel = createInviteRoleLabelResolver(tTrips);
  const statusLabel = createInviteStatusLabelResolver(tInvitations);

  const [state, action, pending] = useActionState(
    revokeTripInvitationAction,
    initialState,
  );

  const error = translateInvitationError(tInvitations, state.errorCode);

  return (
    <article className={styles.inviteCard}>
      <div>
        <p className={styles.memberName}>{roleLabel(invitation.role)}</p>
        <p className={styles.meta}>
          {statusLabel(invitation.status)} ·{" "}
          {new Date(invitation.createdAt).toLocaleDateString(intlLocale)} ·{" "}
          {tMembers("expiresOn")}{" "}
          {new Date(invitation.expiresAt).toLocaleDateString(intlLocale)}
        </p>
      </div>
      {invitation.status === "active" ? (
        <form action={action}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="invitationId" value={invitation.id} />
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="secondary" loading={pending}>
            {tMembers("revokeInvite")}
          </Button>
        </form>
      ) : null}
    </article>
  );
}
