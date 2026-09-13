"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/Field/Field";
import { Select } from "@/components/ui/Select/Select";
import { Button } from "@/components/ui/Button/Button";
import {
  createTripInviteAction,
  type CreateInviteActionState,
} from "@/features/trips/invitations/actions";
import { createTripRoleLabelResolver } from "@/features/trips/trip-labels";
import { translateInvitationError } from "@/features/trips/invitations/translate-invitation-error";
import { CopyInviteUrl } from "./CopyInviteUrl";
import styles from "./MembersPage.module.scss";

const initialState: CreateInviteActionState = {};

type CreateInviteFormProps = {
  tripId: string;
  onCancel?: () => void;
};

export function CreateInviteForm({ tripId, onCancel }: CreateInviteFormProps) {
  const tMembers = useTranslations("TripMembers");
  const tInvitations = useTranslations("TripInvitations");
  const tTrips = useTranslations("Trips");
  const tCommon = useTranslations("Common");
  const roleLabel = createTripRoleLabelResolver(tTrips);

  const [state, action, pending] = useActionState(
    createTripInviteAction,
    initialState,
  );

  const error = translateInvitationError(tInvitations, state.errorCode);

  return (
    <div className={styles.inviteSection}>
      <h2 className={styles.sectionTitle}>{tMembers("createInviteTitle")}</h2>
      <form action={action} className={styles.form}>
        <input type="hidden" name="tripId" value={tripId} />
        <Field label={tMembers("permission")} htmlFor="invite-role">
          <Select id="invite-role" name="role" defaultValue="member" required>
            <option value="member">{roleLabel("member")}</option>
            <option value="owner">{roleLabel("owner")}</option>
          </Select>
        </Field>
        <p className={styles.helper}>{tInvitations("errors.ownerHint")}</p>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <div className={styles.actionsRow}>
          <Button type="submit" loading={pending}>
            {tMembers("createInviteSubmit")}
          </Button>
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              {tCommon("cancel")}
            </Button>
          ) : null}
        </div>
      </form>
      {state.inviteUrl ? (
        <div className={styles.newInvite}>
          <p className={styles.helper}>{tMembers("copyLinkHint")}</p>
          <CopyInviteUrl inviteUrl={state.inviteUrl} />
        </div>
      ) : null}
    </div>
  );
}
