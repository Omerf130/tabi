"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button/Button";
import {
  revokeTripInvitationAction,
  type RevokeInviteActionState,
} from "@/features/trips/invitations/actions";
import {
  INVITE_ROLE_LABELS,
  INVITE_STATUS_LABELS,
} from "@/features/trips/invitations/constants";
import type { InvitationListItem } from "@/features/trips/invitations/public-invite";
import styles from "./MembersPage.module.scss";

const initialState: RevokeInviteActionState = {};

type InvitationRowProps = {
  tripId: string;
  invitation: InvitationListItem;
};

export function InvitationRow({ tripId, invitation }: InvitationRowProps) {
  const [state, action, pending] = useActionState(
    revokeTripInvitationAction,
    initialState,
  );

  return (
    <article className={styles.inviteCard}>
      <div>
        <p className={styles.memberName}>
          {INVITE_ROLE_LABELS[invitation.role]}
        </p>
        <p className={styles.meta}>
          {INVITE_STATUS_LABELS[invitation.status]} ·{" "}
          {new Date(invitation.createdAt).toLocaleDateString("he-IL")} · פג{" "}
          {new Date(invitation.expiresAt).toLocaleDateString("he-IL")}
        </p>
      </div>
      {invitation.status === "active" ? (
        <form action={action}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="invitationId" value={invitation.id} />
          {state.error ? (
            <p className={styles.error} role="alert">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" variant="secondary" loading={pending}>
            ביטול הזמנה
          </Button>
        </form>
      ) : null}
    </article>
  );
}
